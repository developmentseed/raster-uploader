import os
import json
import boto3
import unittest

from unittest import mock
from moto import mock_s3
from handler import handler
from test.request import MockResponse


def mocked_patch_requests(*args, **kwargs):
    return MockResponse({"id": 1}, 200)


def mocked_put_requests(*args, **kwargs):
    return MockResponse({"id": 1}, 200)


class TestMultiple(unittest.TestCase):
    @mock_s3
    @mock.patch("requests.patch", side_effect=mocked_patch_requests)
    @mock.patch("requests.put", side_effect=mocked_put_requests)
    def test_single(self, mock_patch, mock_put):
        os.environ["AWS_ACCESS_KEY_ID"] = "123"
        os.environ["AWS_SECRET_ACCESS_KEY"] = "123"

        mock_s3 = boto3.resource("s3", region_name="us-east-1")
        mock_s3.create_bucket(Bucket="export-bucket")
        mock_s3.create_bucket(Bucket="import-bucket")

        object = mock_s3.Object("import-bucket", "test.tif")
        object.put(Body=b"123")
        object = mock_s3.Object("import-bucket", "folder/folder2/test2.tif")
        object.put(Body=b"123")
        object = mock_s3.Object("import-bucket", "folder/folder2/test3.gif")
        object.put(Body=b"123")

        os.environ["BUCKET"] = "export-bucket"
        os.environ["API"] = "http://example.com/api"

        res = handler(
            {
                "Records": [
                    {
                        "body": json.dumps(
                            {
                                "token": "123",
                                "config": {
                                    "type": "s3",
                                    "collection": 1,
                                    "url": "s3://import-bucket/folder/",
                                    "aws_access_key_id": "key_123",
                                    "aws_secret_access_key": "secret_123",
                                },
                            }
                        )
                    }
                ]
            },
            None,
        )

        self.assertEqual(len(mock_patch.call_args_list), 2)
        self.assertEqual(len(mock_put.call_args_list), 2)


if __name__ == "__main__":
    unittest.main()
