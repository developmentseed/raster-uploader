import os
import boto3
import requests
import numpy as np
from netCDF4 import Dataset
from rasterio.crs import CRS
from rasterio.warp import calculate_default_transform
from rasterio.io import MemoryFile
from rio_cogeo.cogeo import cog_translate

s3 = boto3.client("s3")

def handler(event, context):
    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        print(e)
        return e

    s3files = s3.list_objects_v2(
        Bucket=os.environ.get("BUCKET"),
        Delimiter='/',
        Prefix=f'uploads/{event.get("upload")}/'
    )

    s3files = s3files.get('Contents', [])

    if len(s3files) == 0:
        print('Error: No uploaded file!');
        return

    s3file = None
    s3ext = None
    for ext in meta['limits']['extensions']:
        if s3files[0]['Key'].endswith(ext):
            s3file = s3files[0]['Key']
            s3ext = ext
            break;

    if s3file is None:
        print('ERROR: No supported formats!')
        return

    pth = f'/tmp/{os.path.basename(s3file)}'
    with open(pth, 'wb') as f:
        s3.download_fileobj(os.environ.get('BUCKET'), s3file, f)

    if s3ext == "nc":
        pth = nc(pth, event)
    else:
        print('ERROR: No processing pipeline')
        return

    final = step({
        'upload': event.get('upload'),
        'type': 'cog',
        'config': event,
        'step': {}
    }, event.get('token'))

    s3.upload_file(
        pth,
        os.environ.get('BUCKET'),
        f'uploads/{event.get("upload")}/step/{final.get("id")}/final.tif'
    )


def nc(pth, config):
    #variable_name = config['variable_name']
    #x_variable, y_variable = config.get('x_variable'), config.get('y_variable')
    src = Dataset(pth, "r")

    if config.get('group') is None and len(src.groups) == 1:
        config['group'] = list(src.groups.keys())[0]
    elif config.get('group') is None and len(src.groups) > 1:
        selections = []
        for var in data.groups:
            selections.append({
                'name': var
            })

        return step({
            'upload': config.get('upload'),
            'type': 'selection',
            'config': config,
            'step': {
                'title': 'Select a NetCDF Group',
                'selections': selections,
                'variable': 'group'
            }
        }, config.get('token'))

    if config.get('group'):
        data = src.groups[config.get('group')]
    else:
        data = src

    if config.get('variable') is None:
        selections = []
        for var in data.variables:
            selections.append({
                'name': var
            })

        return step({
            'upload': config.get('upload'),
            'type': 'selection',
            'config': config,
            'step': {
                'title': 'Select a NetCDF Variable',
                'selections': selections,
                'variable': 'variable'
            }
        }, config.get('token'))


    variable = data[config.get('variable')][:]
    nodata_value = variable.fill_value
    # IDEMP SPECIFIC
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

    src_crs = config.get('src_crs')

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
    affine_transformation = config.get('affine_transformation')
    if affine_transformation:
        xres = (xmax - xmin) / float(src_width)
        yres = (ymax - ymin) / float(src_height)
        geotransform = eval(affine_transformation)
        dst_transform = Affine.from_gdal(*geotransform)

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
        compress="deflate",
        blockxsize=128,
        blockysize=128,
        overview_level=5
    )

    print("profile h/w: ", output_profile["height"], output_profile["width"])
    outfilename = f'{os.path.splitext(pth)[0]}.tif'

    with MemoryFile() as memfile:
        with memfile.open(**output_profile) as mem:
            data = variable.astype(np.float32)
            mem.write(data, indexes=1)
        cog_translate(
            memfile,
            outfilename,
            output_profile,
            config=dict(GDAL_NUM_THREADS="ALL_CPUS", GDAL_TIFF_OVR_BLOCKSIZE="128"),
        )
    return outfilename

def step(step, token):
    try:
        step_res = requests.post(
            f"{os.environ.get('API')}/api/upload/{step.get('upload')}/step",
            headers={
                'Authorization': f'bearer {token}'
            },
            json={
                'type': step.get('type'),
                'step': step.get('step'),
                'config': step.get('config')
            }
        )

        step_res.raise_for_status()

        return step_res.json()
    except Exception as e:
        print(e)
        return e

if __name__ == "__main__":
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://localhost:4999'
    #os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'token': 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925',
        #'variable': 'precipitationCal',
        'upload': 14
    })
