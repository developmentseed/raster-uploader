import boto3
import requests

s3 = boto3.resource("s3")

def handler(event):
    try:
        

        files = []
        bucket = s3.Bucket(bucket)
        for obj in bucket.objects.filter(Prefix=prefix):
            if file_type:
                if obj.key.endswith(file_type):
                    files.append(obj.key)
            else:
                files.append(obj.key)
        return files

    except Exception as e:
        print(e)
        return e

    res = dict({
        "s3": f's3://{event["bucket"]}/{f}'
    })

    return res
