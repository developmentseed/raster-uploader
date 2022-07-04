import os
import json
import boto3
import time
import requests
import numpy as np
import sys
import traceback
from netCDF4 import Dataset
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform
from rasterio.io import MemoryFile
from rio_cogeo.cogeo import cog_translate

from lib.step import step
from lib.nc import nc
from lib.tiff import tiff
from lib.compression import decompress

s3 = boto3.client("s3")

def error(event, err):
    print('ERROR', err);
    traceback.print_exc(file=sys.stdout)

    return step({
        'upload': event["config"]["upload"],
        'type': 'error',
        'config': event["config"],
        'step': {
            'message': err
        }
    }, event['token'])

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])

    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        return error(event, str(e))

    s3files = []
    attempts = 0
    while len(s3files) == 0 and attempts < 5:
        try:
            time.sleep(attempts)

            s3files_req = s3.list_objects_v2(
                Bucket=os.environ.get("BUCKET"),
                Delimiter='/',
                Prefix=f'uploads/{event["config"].get("upload")}/'
            )

            s3files = s3files_req.get('Contents', [])

            attempts = attempts + 1
        except Exception as e:
            return error(event, str(e))

    if len(s3files) == 0:
        return error(event, 'No uploaded file!')

    try: # Download & Decompression
        pth = f'/tmp/{os.path.basename(s3files[0]["Key"])}'
        with open(pth, 'wb') as f:
            s3.download_fileobj(os.environ.get('BUCKET'), s3files[0]["Key"], f)

        s3ext = os.path.splitext(s3files[0]["Key"])[1]
        if s3ext in meta['limits']['compression']:
            tmppath, files = decompress(pth, event)
        else:
            files = [ pth ]
    except Exception as e:
        return error(event, str(e))

    filtered = []
    for file in files: # Filter by supported extensions
        if os.path.splitext(file)[1] in meta['limits']['extensions']:
            filtered.append(file)

    if len(filtered) == 0:
        return error(event, 'No supported rasters found!')
    elif len(filtered) > 1:
        selections = []
        for file in filtered:
            selections.append({
                'name': file.replace(tmppath, '')
            });

        return step({
            'upload': event["config"]["upload"],
            'type': 'selection',
            'config': event["config"],
            'step': {
                'title': 'Select a file from the archive',
                'selections': selections,
                'variable': 'file'
                }
        }, event["token"])

    try:
        if os.path.splitext(filtered[0])[1] == ".nc":
            print('NetCDF Conversion')
            pth = nc(filtered[0], event)
        elif os.path.splitext(filtered[0])[1] == ".tif":
            print('Tiff Conversion')
            pth = tiff(filtered[0], event)
        else:
            return error(event, 'No processing pipeline')
    except Exception as e:
        return error(event, str(e))

    if pth is None:
        return None

    final = step({
        'upload': event["config"]["upload"],
        'type': 'cog',
        'config': event["config"],
        'step': {}
    }, event["token"])

    print('Final', final)
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
                    'upload': 1,
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
