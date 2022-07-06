import os
import json
import boto3
import time
import requests
import numpy as np

from lib.step import step
from netCDF4 import Dataset
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform
from rasterio.io import MemoryFile
from rio_cogeo.cogeo import cog_translate

def nc(pth, event):
    #variable_name = event["config"]['variable_name']
    #x_variable, y_variable = event["config"].get('x_variable'), event["config"].get('y_variable')
    src = Dataset(pth, "r")

    if event["config"].get('group') is None and len(src.groups) == 1:
        event["config"]['group'] = list(src.groups.keys())[0]
    elif event["config"].get('group') is None and len(src.groups) > 1:
        selections = []
        for var in data.groups:
            selections.append({
                'name': var
            })

        step({
            'upload': event["config"]["upload"],
            'type': 'selection',
            'config': event["config"],
            'step': {
                'title': 'Select a NetCDF Group',
                'selections': selections,
                'variable': 'group'
            }
        }, event["token"])
        return None

    if event["config"].get('group'):
        data = src.groups[event["config"].get('group')]
    else:
        data = src

    if event["config"].get('variable') is None:
        selections = []
        for var in data.variables:
            selections.append({
                'name': var
            })

        step({
            'upload': event["config"]["upload"],
            'type': 'selection',
            'config': event["config"],
            'step': {
                'title': 'Select a NetCDF Variable',
                'selections': selections,
                'variable': 'variable'
            }
        }, event["token"])

        return None

    variable = data[event["config"].get('variable')][:]
    nodata_value = variable.fill_value

    # not perfect but something for now
    if len(variable.shape) == 3 and variable.shape[0] == 1:
        variable = np.transpose(variable[0])

    x_variable = None
    y_variable = None
    #---

    # This implies a global spatial extent, which is not always the case
    src_height, src_width = variable.shape[0], variable.shape[1]
    if x_variable and y_variable:
        xmin = src[x_variable][:].min()
        xmax = src[x_variable][:].max()
        ymin = src[y_variable][:].min()
        ymax = src[y_variable][:].max()
    else:
        xmin, ymin, xmax, ymax = [-180, -90, 180, 90]

    src_crs = event["config"].get('src_crs')

    if src_crs:
        src_crs = CRS.from_proj4(src_crs)
    else:
        src_crs = CRS.from_epsg(4326)

    dst_crs = CRS.from_epsg(4326)

    # calculate dst transform
    dst_transform, dst_width, dst_height = calculate_default_transform(
        src_crs, dst_crs, src_width, src_height, left=xmin, bottom=ymin, right=xmax, top=ymax
    )

    # https://github.com/NASA-IMPACT/cloud-optimized-data-pipelines/blob/rwegener2-envi-to-cog/docker/omno2-to-cog/OMNO2d.003/handler.py
    affine_transformation = event["config"].get('affine_transformation')
    if affine_transformation:
        xres = (xmax - xmin) / float(src_width)
        yres = (ymax - ymin) / float(src_height)
        geotransform = eval(affine_transformation)
        dst_transform = Affine.from_gdal(*geotransform)

    cog = event['config']['cog']

    # Save output as COG
    output_profile = dict(
        driver="GTiff",
        dtype=variable.dtype,
        count=1,
        crs=src_crs,
        transform=dst_transform,
        height=dst_height,
        width=dst_width,
        nodata=nodata_value,
        tiled=True,
        compress=cog['compression'],
        blockxsize=cog['blocksize'],
        blockysize=cog['blocksize'],
        overview_level=cog['overview']
    )

    print("profile h/w: ", output_profile["height"], output_profile["width"])
    outfilename = f'{os.path.splitext(pth)[0]}.tif'

    with MemoryFile() as memfile:
        with memfile.open(**output_profile) as mem:
            data = variable.astype(np.float32)
            mem.write(data, indexes=1)

        print(outfilename);
        cog_translate(
            memfile,
            outfilename,
            output_profile,
            config=dict(GDAL_NUM_THREADS="ALL_CPUS", GDAL_TIFF_OVR_BLOCKSIZE="128"),
            quiet=False
        )
    return outfilename
