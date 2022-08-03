import os
import json
import boto3
import unittest

from test.request import MockResponse
from unittest import mock
from moto import mock_s3
from handler import handler

def mocked_requests(*args, **kwargs):
    if args[0] == "http://example.com/api/api/collection/9":
        return MockResponse({
            "id": 9,
            "source_id": 1
        }, 200)
    if args[0] == "http://example.com/api/api/source/1":
        return MockResponse({
            "id": 9,
            "type": "aws",
            "glob": "*.tif"
        }, 200)
    else:
        return MockResponse({ "id": 1 }, 200)

class TestEvent(unittest.TestCase):

    @mock_s3
    @mock.patch('requests.patch', side_effect=mocked_requests)
    @mock.patch('requests.get', side_effect=mocked_requests)
    def test_event(self, mock_patch, mock_get):
        os.environ["AWS_ACCESS_KEY_ID"] = '123'
        os.environ["AWS_SECRET_ACCESS_KEY"] = '123'

        mock_s3 = boto3.resource('s3', region_name='us-east-1')
        mock_s3.create_bucket(Bucket='export-bucket')
        mock_s3.create_bucket(Bucket='import-bucket')

        object = mock_s3.Object('import-bucket', 'test.tif')
        object.put(Body=b'123')

        os.environ["BUCKET"] = 'export-bucket'
        os.environ["API"] = 'http://example.com/api'

        res = handler({
            "Records": [{
                "body": json.dumps({
                    'version': '0',
                    'id': 'ea5586e1-99f0-c927-a0fc-287d884aa362',
                    'detail-type': 'Scheduled Event',
                    'source': 'aws.events',
                    'account': '123',
                    'time': '2022-08-03T17:47:00Z',
                    'region': 'us-east-1',
                    'resources': [
                        'arn:aws:events:us-east-1:123:rule/raster-uploader-prod-schedule-9'
                    ],
                    'detail': {}
                })
            }]
        }, None)

        self.assertEqual(len(mock_patch.call_args_list), 1)

if __name__ == '__main__':
    unittest.main()
