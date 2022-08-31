import os
import re
import json
import boto3
import time
import requests
import numpy as np

from lib.step import step

import rasterio
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform
from rasterio.io import MemoryFile
from rio_cogeo.cogeo import cog_translate


def hdf5(pth, event):
    with rasterio.open(pth) as src:
        if event["config"].get("group") is None and len(src.subdatasets) == 1:
            event["config"]["group"] = list(src.groups.keys())[0]
        elif event["config"].get("group") is None and len(src.subdatasets) > 1:
            selections = []
            for var in src.subdatasets:
                var = re.sub('HDF5:.*?:/?', '', var)
                selections.append({"name": var})

            step(
                {
                    "upload": event["config"]["upload"],
                    "parent": event.get("parent"),
                    "type": "selection",
                    "config": event["config"],
                    "step": {
                        "title": "Select a HDF5 Group",
                        "selections": selections,
                        "variable": "group",
                    },
                },
                event["token"],
            )
            return None

        data = None
        if event["config"].get("group"):
            for sub in src.subdatasets:
                if event["config"]["group"] in sub:
                    data = rasterio.open(sub)

            if data is None:
                raise Exception("Could not find dataset with that group ID")

        else:
            data = src

    if data.crs is None:
        src_crs = event["config"].get("src_crs")

        if src_crs:
            src_crs = CRS.from_proj4(src_crs)
        else:
            step(
                {
                    "upload": event["config"]["upload"],
                    "parent": event.get("parent"),
                    "type": "text",
                    "config": event["config"],
                    "step": {
                        "title": "Select a CRS or EPSG Code",
                        "variable": "srs_crs",
                    },
                },
                event["token"],
            )
            return None


    # This implies a global spatial extent, which is not always the case
    src_height, src_width = data.shape[0], data.shape[1]
    xmin, ymin, xmax, ymax = [-180, -90, 180, 90]

    dst_crs = CRS.from_epsg(4326)

    # calculate destination transform
    dst_transform, dst_width, dst_height = calculate_default_transform(
        src_crs,
        dst_crs,
        src_width,
        src_height,
        left=xmin,
        bottom=ymin,
        right=xmax,
        top=ymax,
    )

    # https://github.com/NASA-IMPACT/cloud-optimized-data-pipelines/blob/rwegener2-envi-to-cog/docker/omno2-to-cog/OMNO2d.003/handler.py
    affine_transformation = event["config"].get("affine_transformation")
    if affine_transformation:
        xres = (xmax - xmin) / float(src_width)
        yres = (ymax - ymin) / float(src_height)
        geotransform = eval(affine_transformation)
        dst_transform = Affine.from_gdal(*geotransform)

    cog = event["config"]["cog"]

    # Save output as COG
    output_profile = dict(
        driver="GTiff",
        dtype=data.dtype,
        count=1,
        crs=src_crs,
        transform=dst_transform,
        height=dst_height,
        width=dst_width,
        nodata=nodata_value,
        tiled=True,
        compress=cog["compression"],
        blockxsize=cog["blocksize"],
        blockysize=cog["blocksize"],
        overview_level=cog["overview"],
    )

    print("profile h/w: ", output_profile["height"], output_profile["width"])
    outfilename = f"{os.path.splitext(pth)[0]}.tif"

    with MemoryFile() as memfile:
        with memfile.open(**output_profile) as mem:
            data = variable.astype(np.float32)
            mem.write(data, indexes=1)

        cog_translate(
            memfile,
            outfilename,
            output_profile,
            config=dict(GDAL_NUM_THREADS="ALL_CPUS", GDAL_TIFF_OVR_BLOCKSIZE="128"),
            quiet=False,
        )
    return outfilename
