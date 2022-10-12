function std() {
    window.std = async function(url, opts = {}, redirect = true) {
        try {
            url = new URL(url);
        } catch (err) {
            url = new URL(url, window.location.origin);
        }

        try {
            if (!opts.headers) opts.headers = {};

            if (typeof opts.body === 'object' && !opts.headers['Content-Type']) {
                opts.body = JSON.stringify(opts.body);
                opts.headers['Content-Type'] = 'application/json';
            }

            if (localStorage.token && !opts.headers.Authorization) {
                opts.headers['Authorization'] = 'Bearer ' + localStorage.token;
            }

            const res = await fetch(url, opts);

            let bdy = {};
            if ((res.status < 200 || res.status >= 400) && ![401].includes(res.status)) {
                try {
                    bdy = await res.json();
                } catch (err) {
                    throw new Error(`Status Code: ${res.status}`);
                }

                const err = new Error(bdy.message || `Status Code: ${res.status}`);
                err.body = bdy;
                throw err;
            } else if (redirect && res.status === 401) {
                delete localStorage.token;
                return window.location.reload();
            }

            return await res.json();
        } catch (err) {
            throw new Error(err.message);
        }
    }
}

export default std;
