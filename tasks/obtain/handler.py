import boto3
import requests

s3 = boto3.client("s3")

def handler(event, context):
    event = json.loads(event['Records'][0]['body'])

    try:
        meta_res = requests.get(f"{os.environ.get('API')}/api")
        meta_res.raise_for_status()
        meta = meta_res.json()
    except Exception as e:
        print(e)
        return e

if __name__ == "__main__":
    os.environ['BUCKET'] = 'raster-uploader-prod-853558080719-us-east-1'
    os.environ['API'] = 'http://localhost:4999'
    #os.environ['API'] = 'http://raster-uploader-prod-1759918000.us-east-1.elb.amazonaws.com'

    handler({
        'Records': [{
            'body': json.dumps({
                'token': 'uploader.ae5c3b1bed4f09f7acdc23d6a8374d220f797bae5d4ce72763fbbcc675981925',
                'config': {
                    'upload': 15
                    #'variable': 'precipitationCal',
                }
            })
        }]
    }, None)
