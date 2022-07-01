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

def tiff(pth, event):
    cog = event['config']['cog']

    # Save output as COG
    output_profile = dict(
        driver="GTiff",
        tiled=True,
        compress=cog['compression'],
        blockxsize=cog['blocksize'],
        blockysize=cog['blocksize'],
        overview_level=cog['overview']
    )

    outfilename = f'{os.path.splitext(pth)[0]}_cog.tif'

    cog_translate(
        pth,
        outfilename,
        output_profile,
        config=dict(GDAL_NUM_THREADS="ALL_CPUS", GDAL_TIFF_OVR_BLOCKSIZE="128"),
        quiet=False
    )

    return outfilename


