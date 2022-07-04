import gzip
import zipfile
import tarfile
import tempfile
import shutil

def decompress(pth, event):
    tmppath = tempfile.mkdtemp()

    if s3files[0]['Key'].endswith('zip'):
        with zipfile.ZipFile(pth, 'r') as zip_ref:
            zip_ref.extractall(tmppath)

    elif s3files[0]['Key'].endswith('.tar.gz'):
        file = tarfile.open(pth)
        file.extractall(tmppath)
        file.close()

    elif s3files[0]['Key'].endswith('.gz'):
        with gzip.open(pth, 'rb') as f_in:
            with open(os.path.splitext(pth)[0], 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
    else:
        raise Exception('Unsupported compression type')

    shutil.rmtree(dirpath)

    return None
