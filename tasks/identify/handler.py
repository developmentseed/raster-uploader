import os
import json
import boto3
import time
import requests
import numpy as np
from netCDF4 import Dataset
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform
from rasterio.io import MemoryFile
from rio_cogeo.cogeo import cog_translate

from lib.step import step
from lib.nc import nc
from lib.tiff import tiff

s3 = boto3.client("s3")

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])

    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        print(e)
        return e

    s3files = []
    attempts = 0
    while len(s3files) == 0 and attempts < 5:
        time.sleep(attempts)

        s3files_req = s3.list_objects_v2(
            Bucket=os.environ.get("BUCKET"),
            Delimiter='/',
            Prefix=f'uploads/{event["config"].get("upload")}/'
        )

        s3files = s3files_req.get('Contents', [])

        attempts = attempts + 1

    if len(s3files) == 0:
        return step({
            'upload': event["config"].get('upload'),
            'type': 'error',
            'config': event["config"],
            'step': {
                'message': 'No uploaded file!',
            }
        }, event["token"])

    s3file = None
    s3ext = None
    for ext in meta['limits']['extensions']:
        if s3files[0]['Key'].endswith(ext):
            s3file = s3files[0]['Key']
            s3ext = ext
            break;

    if s3file is None:
        return step({
            'upload': event["config"]["upload"],
            'type': 'error',
            'config': event["config"],
            'step': {
                'message': 'No supported formats!',
            }
        }, event['token'])

    pth = f'/tmp/{os.path.basename(s3file)}'
    with open(pth, 'wb') as f:
        s3.download_fileobj(os.environ.get('BUCKET'), s3file, f)

    if s3ext == "nc":
        pth = nc(pth, event)
    if s3ext == "tif":
        pth = tiff(pth, event)
    else:
        return step({
            'upload': event["config"]["upload"],
            'type': 'error',
            'config': event["config"],
            'step': {
                'message': 'No processing pipeline',
            }
        }, event["token"])

    if pth is None:
        return None

    final = step({
        'upload': event["config"]["upload"],
        'type': 'cog',
        'config': event["config"],
        'step': {}
    }, event["token"])

    print(final)
    s3.upload_file(
        pth,
        os.environ.get('BUCKET'),
        f'uploads/{event["config"]["upload"]}/step/{final.get("id")}/final.tif'
    )

if __name__ == "__main__":
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://localhost:4999'
    #os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'Records': [{
            'body': json.dumps({
                'token': 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925',
                'config': {
                    'upload': 37,
                    #'variable': 'precipitationCal',
                    'cog': {
                        'overview': 5,
                        'blocksize': 512,
                        'compression': 'deflate'
                    }
                }
            })
        }]
    }, None)
