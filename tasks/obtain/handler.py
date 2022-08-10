import os
import re
import jwt
import json
import boto3
import requests
from glob import glob
from datetime import datetime
from datetime import timezone
from datetime import timedelta
from urllib.parse import urlparse
from io import BytesIO, SEEK_SET, SEEK_END
from lib.step import step, error


def handler(event, context):
    event = json.loads(event["Records"][0]["body"])

    if event.get("source") == "aws.events":
        collection = int(re.sub("^.*schedule-", "", event["resources"][0]))
        print(f"Event: Collection ID: {collection}")

        token = jwt.encode(
            {
                "exp": datetime.now(tz=timezone.utc) + timedelta(seconds=30),
                "type": "machine",
            },
            os.environ["SigningSecret"],
            algorithm="HS256",
        )

        res = requests.post(
            f"{os.environ.get('API')}/api/machine",
            headers={"Authorization": f"bearer {token}"},
            json={"collection": collection},
        )

        res.raise_for_status()
        res = res.json()

        event = {"token": res["token"], "config": {"collection": collection}}

        collection = requests.get(
            f"{os.environ.get('API')}/api/collection/{collection}",
            headers={"Authorization": f'bearer {event.get("token")}'},
        )

        collection.raise_for_status()
        collection = collection.json()

        source = requests.get(
            f"{os.environ.get('API')}/api/source/{collection['source_id']}",
            headers={"Authorization": f'bearer {event.get("token")}'},
        )

        source.raise_for_status()
        source = source.json()

        event["config"]["url"] = source["url"]
        event["config"]["type"] = source["type"]
        event["config"]["glob"] = source["glob"]

        client = boto3.client(
            "secretsmanager",
            region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
        )
        secrets = client.get_secret_value(
            SecretId=f'{os.environ["StackName"]}-source-{source["id"]}'
        )
        secrets = json.loads(secrets["SecretString"])

        event["config"].update(secrets)

    try:
        if event["config"].get("type") == "s3":
            o = urlparse(event["config"].get("url"), allow_fragments=False)

            s3_client = boto3.client(
                "s3",
                aws_access_key_id=event["config"].get("aws_access_key_id"),
                aws_secret_access_key=event["config"].get("aws_secret_access_key"),
                region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1"),
            )

            key_path = o.path.lstrip("/")

            recursive = False
            if len(key_path) == 0:
                recursive = True
            else:
                try:
                    s3_client.head_object(Bucket=o.netloc, Key=o.path.lstrip("/"))
                except Exception as e:
                    if "Not Found" in str(
                        e
                    ):  # If there is no object it is likely a directory
                        recursive = True
                    else:
                        raise e

            if event["config"].get("collection") is None and recursive:
                return error(
                    event,
                    Exception(
                        "Cannot perform a recursive search on a single upload - use a collection"
                    ),
                )

            if not recursive:
                if event["config"].get("glob") is not None:
                    glob_re = re.compile(glob_to_re(event["config"]["glob"]))

                    if glob_re.match(o.path.lstrip("/")) is not None:
                        s3res = s3_client.get_object(Bucket=o.netloc, Key=o.path.lstrip("/"))

                        handler = BytesIO(s3res["Body"].read())
                        file = os.path.basename(urlparse(event["config"].get("url")).path)
                        single(event, file, handler)
                    else:
                        print("No Input Files Found - potentially due to glob mismatch")
            else:
                # TODO: At the moment this supports up to 1000 keys
                s3list = s3_client.list_objects_v2(
                    Bucket=o.netloc, Prefix=o.path.lstrip("/")
                )

                for key in s3list["Contents"]:
                    s3res = s3_client.get_object(Bucket=o.netloc, Key=key["Key"])

                    if event["config"].get("glob") is not None:
                        glob_re = re.compile(glob_to_re(event["config"]["glob"]))

                        if glob_re.match(key["Key"]) is not None:
                            handler = BytesIO(s3res["Body"].read())
                            file = os.path.basename(urlparse(key["Key"]).path)
                            single(
                                event, file, handler, collection=event["config"]["collection"]
                            )
                    else:
                            handler = BytesIO(s3res["Body"].read())
                            file = os.path.basename(urlparse(key["Key"]).path)
                            single(
                                event, file, handler, collection=event["config"]["collection"]
                            )

        elif event["config"].get("type") == "http":
            res = requests.get(event["config"].get("url"), stream=True)
            res.raise_for_status()

            file = os.path.basename(urlparse(event["config"].get("url")).path)
            handler = ResponseStream(res.iter_content(64))

            single(event, file, handler)
        else:
            print("Unknown Obtain Type")
            exit()

    except Exception as e:  # TODO Post Error Step
        print(event)

        error(event, e)


def single(event, file, handler, collection=None):
    print(f"Processing: {file}")

    ru_s3 = boto3.client(
        "s3", region_name=os.environ.get("AWS_DEFAULT_REGION", "us-east-1")
    )

    if event["config"].get("collection") is not None:
        res = requests.put(
            f"{os.environ.get('API')}/api/upload",
            headers={"Authorization": f'bearer {event.get("token")}'},
            json={"collection_id": event["config"]["collection"], "obtain": True},
        )

        res.raise_for_status()
        upload = res.json()["id"]

        print(f"Created Upload: {upload} (Collection: {event['config']['collection']})")
    else:
        upload = event["config"]["upload"]

    ru_s3.put_object(
        Bucket=os.environ["BUCKET"],
        Key=f"uploads/{upload}/{file}",
        Body=handler,
    )

    meta = ru_s3.head_object(
        Bucket=os.environ["BUCKET"],
        Key=f"uploads/{upload}/{file}",
    )

    print(f"Patching Upload: {upload}")
    res = requests.patch(
        f"{os.environ.get('API')}/api/upload/{upload}",
        headers={"Authorization": f'bearer {event.get("token")}'},
        json={"size": meta.get("ContentLength"), "name": file, "uploaded": True},
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

def glob_to_re(pat: str) -> str:
    """Translate a shell PATTERN to a regular expression.

    Derived from `fnmatch.translate()` of Python version 3.8.13
    SOURCE: https://github.com/python/cpython/blob/v3.8.13/Lib/fnmatch.py#L74-L128
    """

    i, n = 0, len(pat)
    res = ''
    while i < n:
        c = pat[i]
        i = i+1
        if c == '*':
            # -------- CHANGE START --------
            # prevent '*' matching directory boundaries, but allow '**' to match them
            j = i
            if j < n and pat[j] == '*':
                res = res + '.*'
                i = j+1
            else:
                res = res + '[^/]*'
            # -------- CHANGE END ----------
        elif c == '?':
            # -------- CHANGE START --------
            # prevent '?' matching directory boundaries
            res = res + '[^/]'
            # -------- CHANGE END ----------
        elif c == '[':
            j = i
            if j < n and pat[j] == '!':
                j = j+1
            if j < n and pat[j] == ']':
                j = j+1
            while j < n and pat[j] != ']':
                j = j+1
            if j >= n:
                res = res + '\\['
            else:
                stuff = pat[i:j]
                if '--' not in stuff:
                    stuff = stuff.replace('\\', r'\\')
                else:
                    chunks = []
                    k = i+2 if pat[i] == '!' else i+1
                    while True:
                        k = pat.find('-', k, j)
                        if k < 0:
                            break
                        chunks.append(pat[i:k])
                        i = k+1
                        k = k+3
                    chunks.append(pat[i:j])
                    # Escape backslashes and hyphens for set difference (--).
                    # Hyphens that create ranges shouldn't be escaped.
                    stuff = '-'.join(s.replace('\\', r'\\').replace('-', r'\-')
                                     for s in chunks)
                # Escape set operations (&&, ~~ and ||).
                stuff = re.sub(r'([&~|])', r'\\\1', stuff)
                i = j+1
                if stuff[0] == '!':
                    # -------- CHANGE START --------
                    # ensure sequence negations don't match directory boundaries
                    stuff = '^/' + stuff[1:]
                    # -------- CHANGE END ----------
                elif stuff[0] in ('^', '['):
                    stuff = '\\' + stuff
                res = '%s[%s]' % (res, stuff)
        else:
            res = res + re.escape(c)
    return r'(?s:%s)\Z' % res


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
