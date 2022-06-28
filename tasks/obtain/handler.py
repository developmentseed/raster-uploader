import boto3
import requests
from urlparse import urlparse

s3 = boto3.client("s3")

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])

    if event.get('type') == 's3':
        print(event)
    elif event.get('type') == 'http':
        o = urlparse(event.get('url'), allow_fragments=False)

        s3res = s3.get_object(
            Bucket=o.netloc,
            Key=o.path.lstrip('/')
        )



if __name__ == "__main__":
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://localhost:4999'
    #os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'Records': [{
            'body': json.dumps({
                'token': 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925',
                'type': 'http',
                'url': ''
            })
        }]
    }, None)
