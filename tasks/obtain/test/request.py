class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

    def iter_content(self, bts):
        return iter(b"")

    def raise_for_status(self):
        return True
