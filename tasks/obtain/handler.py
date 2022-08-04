import re
import io
import os
import jwt
import json
import boto3
import requests
from datetime import datetime
from datetime import timezone
from datetime import timedelta
from urllib.parse import urlparse
from io import BytesIO, SEEK_SET, SEEK_END
from lib.step import step, error

def handler(event, context):
    event = json.loads(event["Records"][0]["body"])

    if event.get('source') == 'aws.events':
        collection = int(re.sub('^.*schedule-', '', event['resources'][0]))
        print(f'Event: Collection ID: {collection}')

        token = jwt.encode({
            "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=30),
            "type": "machine"
        }, os.environ['SigningSecret'], algorithm="HS256")

        res = requests.post(
            f"{os.environ.get('API')}/api/machine",
            headers={"Authorization": f'bearer {token}'},
            json={
                'collection': collection
            }
        )

        res.raise_for_status()
        res = res.json()

        event = {
            "token": res['token'],
            "config": {
                "collection": collection
            }
        }

        collection = requests.get(
            f"{os.environ.get('API')}/api/collection/{collection}",
            headers={"Authorization": f'bearer {event.get("token")}'}
        )

        collection.raise_for_status()
        collection = collection.json()

        source = requests.get(
            f"{os.environ.get('API')}/api/source/{collection['source_id']}",
            headers={"Authorization": f'bearer {event.get("token")}'}
        )

        source.raise_for_status()
        source = source.json()

        event["config"]["url"] = source["url"]
        event["config"]["type"] = source["type"]
        event["config"]["glob"] = source["glob"]

        client = boto3.client('secretsmanager')
        secrets = client.get_secret_value(SecretId=f'{os.environ["StackName"]}-source-{source["id"]}')
        secrets = json.loads(secrets['SecretString'])

        event["config"].update(secrets)

    if event['config'].get('collection') is not None:
        res = requests.put(
            f"{os.environ.get('API')}/api/upload",
            headers={"Authorization": f'bearer {event.get("token")}'},
            json={
                "collection_id": event['config']['collection']
            },
        )

        res.raise_for_status()
        event['config']['upload'] = res.json()["id"]

        print(f"Created Upload: {event['config']['upload']} (Collection: {event['config']['collection']})")

    try:
        if event["config"].get("type") == "s3":
            o = urlparse(event["config"].get("url"), allow_fragments=False)

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=event["config"].get("aws_access_key_id"),
                aws_secret_access_key=event["config"].get("aws_secret_access_key"),
            )

            key_path = o.path.lstrip("/")

            recursive = False
            if len(key_path) == 0:
                recursive = True
            else:
                try:
                    s3_client.head_object(Bucket=o.netloc, Key=o.path.lstrip("/"))
                except Exception as e:
                    if "Not Found" in str(e): # If there is no object it is likely a directory
                        recursive = True
                    else:
                        raise e

            if event["config"].get("collection") is None and recursive:
                return error(event, Exception("Cannot perform a recursive search on a single upload - use a collection"))

            if not recursive:
                s3res = s3_client.get_object(Bucket=o.netloc, Key=o.path.lstrip("/"))

                handler = io.BytesIO(s3res["Body"].read())
                file = os.path.basename(urlparse(event["config"].get("url")).path)
                single(event, file, handler)
            else:
                # TODO: At the moment this supports up to 1000 keys
                s3list = s3_client.list_objects_v2(Bucket=o.netloc, Prefix=o.path.lstrip("/"))

                for key in s3list['Contents']:
                    s3res = s3_client.get_object(Bucket=o.netloc, Key=key["Key"])

                    handler = io.BytesIO(s3res["Body"].read())
                    file = os.path.basename(urlparse(key["Key"]).path)
                    single(event, file, handler, collection=event["config"]["collection"])

        elif event["config"].get("type") == "http":
            res = requests.get(event["config"].get("url"), stream=True)
            res.raise_for_status()

            file = os.path.basename(urlparse(event["config"].get("url")).path)
            handler = ResponseStream(res.iter_content(64))

            single(event, file, handler)
        else:
            print("Unknown Obtain Type")
            exit()

    except Exception as e: # TODO Post Error Step
        print(event)

        error(event, e)


def single(event, file, handler, collection=None):
    print(f"Processing: {file}")
    ru_s3 = boto3.client("s3")

    upload = event["config"].get("upload")

    ru_s3.put_object(
        Bucket=os.environ["BUCKET"],
        Key=f'uploads/{upload}/{file}',
        Body=handler,
    )

    meta = ru_s3.head_object(
        Bucket=os.environ["BUCKET"],
        Key=f'uploads/{upload}/{file}',
    )

    print(f"Patching Upload: {upload}")
    res = requests.patch(
        f"{os.environ.get('API')}/api/upload/{upload}",
        headers={"Authorization": f'bearer {event.get("token")}'},
        json={
            "size": meta.get("ContentLength"),
            "name": file,
            "uploaded": True
        },
    )

    res.raise_for_status()

class ResponseStream(object):
    def __init__(self, request_iterator):
        self._bytes = BytesIO()
        self._iterator = request_iterator

    def _load_all(self):
        self._bytes.seek(0, SEEK_END)
        for chunk in self._iterator:
            self._bytes.write(chunk)

    def _load_until(self, goal_position):
        current_position = self._bytes.seek(0, SEEK_END)
        while current_position < goal_position:
            try:
                current_position += self._bytes.write(next(self._iterator))
            except StopIteration:
                break

    def tell(self):
        return self._bytes.tell()

    def read(self, size=None):
        left_off_at = self._bytes.tell()
        if size is None:
            self._load_all()
        else:
            goal_position = left_off_at + size
            self._load_until(goal_position)

        self._bytes.seek(left_off_at)
        return self._bytes.read(size)

    def seek(self, position, whence=SEEK_SET):
        if whence == SEEK_END:
            self._load_all()
        else:
            self._bytes.seek(position, whence)


if __name__ == "__main__":
    os.environ["BUCKET"] = "raster-uploader-prod-853558080719-us-east-1"
    os.environ["API"] = "http://localhost:4999"
    # os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler(
        {
            "Records": [
                {
                    "body": json.dumps(
                        {
                            "token": "uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925",
                            "config": {
                                "upload": 1,
                                #'type': 'http',
                                #'url': 'https://download.osgeo.org/geotiff/samples/usgs/o41078a5.tif',
                                "type": "s3",
                                "url": "s3://raster-uploader-prod-853558080719-us-east-1/fixtures/imerg_test.nc",
                                "aws_access_key_id": "",
                                "aws_secret_access_key": "",
                            },
                        }
                    )
                }
            ]
        },
        None,
    )
