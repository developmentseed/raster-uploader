import os
import json
import boto3
import time
import requests
import numpy as np
import sys
import traceback

from lib.step import step

s3 = boto3.client("s3")

def error(event, err):
    print('ERROR', err);
    traceback.print_exc(file=sys.stdout)

    return step({
        'upload': event["config"]["upload"],
        'type': 'error',
        'config': event["config"],
        'step': {
            'message': err,
            'closed': True
        }
    }, event['token'])

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])
    print(event)

    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        return error(event, str(e))

    try: # Download & Decompression
        pth = f'/tmp/{os.path.basename(s3files[0]["Key"])}'
        with open(pth, 'wb') as f:
            s3.download_fileobj(meta['assets']['bucket'], s3files[0]["Key"], f)
    except Exception as e:
        return error(event, str(e))

    final = step({
        'upload': event["config"]["upload"],
        'type': 'cog',
        'config': event["config"],
        'step': {}
    }, event["token"])

    print('Final', final)
    s3.upload_file(
        pth,
        meta['assets']['bucket'],
        f'uploads/{event["config"]["upload"]}/step/{final.get("id")}/final.tif'
    )

if __name__ == "__main__":
    os.environ['API'] = 'http://localhost:4999'

    upload = 53
    token = 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925'

    upload = requests.get(
        f"{os.environ.get('API')}/api/upload/{upload}",
        headers={
            'Authorization': f'bearer {token}'
        },
    )
    upload.raise_for_status()
    upload = upload.json()

    upload['config']['upload'] = upload['id']

    handler({
        'Records': [{
            'body': json.dumps({
                'token': token,
                'config': upload['config']
            })
        }]
    }, None)
