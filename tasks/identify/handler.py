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
from lib.hdf5 import hdf5
from lib.compression import decompress

s3 = boto3.client("s3")


def error(event, err):
    print("ERROR", err)
    traceback.print_exc(file=sys.stdout)

    return step(
        {
            "upload": event["config"]["upload"],
            "type": "error",
            "parent": event["parent"],
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

    s3files = []
    attempts = 0
    while len(s3files) == 0 and attempts < 5:
        try:
            time.sleep(attempts)

            s3files_req = s3.list_objects_v2(
                Bucket=meta["assets"]["bucket"],
                Delimiter="/",
                Prefix=f'uploads/{event["config"].get("upload")}/',
            )

            s3files = s3files_req.get("Contents", [])

            attempts = attempts + 1
        except Exception as e:
            return error(event, str(e))

    if len(s3files) == 0:
        return error(event, "No uploaded file!")

    try:  # Download & Decompression
        pth = f'/tmp/{os.path.basename(s3files[0]["Key"])}'
        with open(pth, "wb") as f:
            s3.download_fileobj(meta["assets"]["bucket"], s3files[0]["Key"], f)

        s3ext = os.path.splitext(s3files[0]["Key"])[1]
        if s3ext in meta["limits"]["compression"]:
            tmppath, files = decompress(pth, event)
        else:
            files = [pth]
    except Exception as e:
        return error(event, str(e))

    filtered = []
    for file in files:  # Filter by supported extensions
        if os.path.splitext(file)[1] in meta["limits"]["extensions"]:
            filtered.append(file)

    if len(filtered) == 0:
        return error(event, "No supported rasters found!")
    elif len(filtered) > 1 and event["config"].get("file") is not None:
        filtered = [tmppath + event["config"]["file"]]
    elif len(filtered) > 1:
        selections = []
        for file in filtered:
            selections.append({"name": file.replace(tmppath, "")})

        return step(
            {
                "upload": event["config"]["upload"],
                "parent": event["parent"],
                "type": "selection",
                "config": event["config"],
                "step": {
                    "title": "Select a file from the archive",
                    "selections": selections,
                    "variable": "file",
                },
            },
            event["token"],
        )

    try:
        if os.path.splitext(filtered[0])[1] in [".nc"]:
            print("NetCDF Conversion")
            pth = nc(filtered[0], event)
        elif os.path.splitext(filtered[0])[1] in [".tif"]:
            print("Tiff Conversion")
            pth = tiff(filtered[0], event)
        elif os.path.splitext(filtered[0])[1] in [".hdf", ".h5", ".hdf5", ".he5"]:
            print("HDF5 Conversion")
            pth = hdf5(filtered[0], event)
        else:
            return error(event, "No processing pipeline")
    except Exception as e:
        return error(event, str(e))

    if pth is None:
        return None

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
        pth,
        meta["assets"]["bucket"],
        f'uploads/{event["config"]["upload"]}/step/{final.get("id")}/final.tif',
    )


if __name__ == "__main__":
    os.environ["API"] = "http://localhost:4999"
    # os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    upload = 61
    token = "uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925"

    upload = requests.get(
        f"{os.environ.get('API')}/api/upload/{upload}",
        headers={"Authorization": f"bearer {token}"},
    )
    upload.raise_for_status()
    upload = upload.json()

    upload["config"]["upload"] = upload["id"]

    handler(
        {
            "Records": [
                {"body": json.dumps({"token": token, "config": upload["config"]})}
            ]
        },
        None,
    )
