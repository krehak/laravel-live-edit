class Request {
    private type: string;
    private url: string;
    private data: {}|null;

    public post(url: string, data: {}|null = null) {
        return this.request('post', url, data);
    }

    public request(type: string, url: string, data: {}|null = null) {
        this.type = type;
        this.url = url;
        this.data = data;

        return this.send();
    }

    private getData() {
        let data = this.data === null ? {} : this.data;

        return JSON.stringify(data);
    }

    private getCsrfHeaderName() {
        let headerName = null;

        if(window['live_edit_csrf_header_name']) {
            headerName = window['live_edit_csrf_header_name'];
        } else {
            headerName = 'X-CSRF-TOKEN';
        }

        return headerName;
    }

    private getCsrfToken() {
        let token = null;
        let headerToken = document.head.querySelector('meta[name="csrf-token"]')

        if(headerToken) {
            token = headerToken.getAttribute('content');
        } else if(window['live_edit_force_csrf_token']) {
            token = window['live_edit_force_csrf_token'];
        } else if(window['live_edit_csrf_token']) {
            token = window['live_edit_csrf_token'];
        } else if(window['csrf_token']) {
            token = window['csrf_token'];
        }

        return token;
    }

    private send() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                if(this.readyState !== 4) return;

                resolve(this);
            };

            xhr.open(this.type.toUpperCase(), this.url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader(this.getCsrfHeaderName(), this.getCsrfToken());
            xhr.send(this.getData());
        });
    }
}

export default Request;
