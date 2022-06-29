import os
import json
import boto3
import requests
from urllib.parse import urlparse
from io import BytesIO, SEEK_SET, SEEK_END

s3 = boto3.client("s3")

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])

    if event.get('type') == 's3':
        o = urlparse(event.get('url'), allow_fragments=False)

        s3res = s3.get_object(
            Bucket=o.netloc,
            Key=o.path.lstrip('/')
        )
    elif event.get('type') == 'http':
        res = requests.get(event.get('url'), stream=True)
        res.raise_for_status()

        file = os.path.basename(urlparse(event.get('url')).path)
        handler = ResponseStream(res.iter_content(64))

    s3.put_object(
        Bucket=os.environ['BUCKET'],
        Key=f'uploads/{event.get("upload")}/{file}',
        Body=handler
    )

    meta = s3.head_object(
        Bucket=os.environ['BUCKET'],
        Key=f'uploads/{event.get("upload")}/{file}'
    )

    res = requests.patch(
        f"{os.environ.get('API')}/api/upload/{event.get('upload')}",
        headers={
            'Authorization': f'bearer {event.get("token")}'
        },
        json={
            'size': meta.get('ContentLength'),
            'name': file
        }
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
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://localhost:4999'
    #os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'Records': [{
            'body': json.dumps({
                'token': 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925',
                'type': 'http',
                'upload': 1,
                'url': 'https://download.osgeo.org/geotiff/samples/usgs/o41078a5.tif'
            })
        }]
    }, None)
