import os
import json
import boto3
import time
import requests
import numpy as np
import sys
import traceback
import rasterio

from lib.step import step

s3 = boto3.client("s3")


def error(event, err):
    print("ERROR", err)
    traceback.print_exc(file=sys.stdout)

    return step(
        {
            "upload": event["config"]["upload"],
            "parent": event["parent"],
            "type": "error",
            "config": event["config"],
            "step": {"message": err, "closed": True},
        },
        event["token"],
    )


def handler(event, context):
    event = json.loads(event["Records"][0]["body"])
    print(event)

    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        return error(event, str(e))

    pth = "/tmp/final.tif"
    try:  # Download & Decompression
        with open(pth, "wb") as f:
            s3.download_fileobj(
                meta["assets"]["bucket"],
                f'uploads/{event["config"]["upload"]}/step/{event["transform"]["step"]}/final.tif',
                f,
            )
    except Exception as e:
        return error(event, str(e))

    with rasterio.open(pth) as inp:
        inp_profile = inp.profile
        inp = inp.read()

        ttype = event["transform"]["type"]
        if ttype == "cog:flip":
            data = np.flip(inp, axis=0)

        with rasterio.open(pth + ".out", "w", **inp_profile) as dst:
            dst.write(data)

    final = step(
        {
            "upload": event["config"]["upload"],
            "parent": event["parent"],
            "type": "cog",
            "config": event["config"],
            "step": {},
        },
        event["token"],
    )

    print("Final", final)
    s3.upload_file(
        pth + ".out",
        meta["assets"]["bucket"],
        f'uploads/{event["config"]["upload"]}/step/{final.get("id")}/final.tif',
    )


if __name__ == "__main__":
    os.environ["API"] = "http://localhost:4999"

    upload = 62
    upload_step = 56
    token = "uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925"

    handler(
        {
            "Records": [
                {
                    "body": json.dumps(
                        {
                            "token": token,
                            "config": {
                                "upload": upload,
                            },
                            "transform": {"step": upload_step, "type": "cog:flip"},
                        }
                    )
                }
            ]
        },
        None,
    )
