import os
import boto3
import requests

s3 = boto3.resource("s3")

def handler(event):
    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        print(e)
        return e


    res = dict({
        "s3": f's3://{event["bucket"]}/{f}'
    })

    return res

if __name__ == "__main__":
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'upload': '1'
    })
