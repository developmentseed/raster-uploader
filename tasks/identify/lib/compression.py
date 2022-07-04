import os
import gzip
import zipfile
import tarfile
import tempfile
import shutil

def decompress(pth, event):
    tmppath = tempfile.mkdtemp()

    if pth.endswith('zip'):
        with zipfile.ZipFile(pth, 'r') as zip_ref:
            zip_ref.extractall(tmppath)
    elif pth.endswith('.tar.gz'):
        file = tarfile.open(pth)
        file.extractall(tmppath)
        file.close()
    elif pth.endswith('.gz'):
        with gzip.open(pth, 'rb') as f_in:
            with open(os.path.splitext(pth)[0], 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
    else:
        raise Exception('Unsupported compression type')

    files = []
    for r, d, f in os.walk(tmppath):
        for file in f:
            files.append(os.path.join(r, file))

    return files
