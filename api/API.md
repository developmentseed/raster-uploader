## Authentication

### UI Flow

Initial authentication must always first be performed with a successful POST of the username &
password to the `/login` endpoint.

### Programatic Flow

Once an API token has been obtained, scripted calls to the API can be made by using the Bearer
Authentication. This header must be included with all calls to the API.

Note: Basic authentication (username, password) is not supported by any API endpoint other than initial login.
A valid API token must generated for programatic access

_Example_
```
Authorization: Bearer {api token}
```

#### Javascript Fetch Example
```js
fetch('https://example.com/api/data', {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
        'Authorization': 'Bearer 1234-your-token-5678',
        'Content-Type': 'application/json'
    }
});

