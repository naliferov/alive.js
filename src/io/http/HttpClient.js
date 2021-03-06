export default class HttpClient {

    userAgent = '';
    api;

    constructor(baseURL = '', headers = {}) {

        headers['Content-Type'] = 'application/json';
        //if (token) {
        //    headers['Authorization'] = `Bearer ${token}`
        //}
        //this.api = axios.create({baseURL, headers});
    }

    async get(url, params = {}, headers = {}) {

        if (this.userAgent && !headers['user-agent']) {
            headers['user-agent'] = this.userAgent;
        }

        const response = await fetch(url, {headers});

        return {
            statusCode: response.status,
            data: await response.json(),
            headers: response.headers
        }
    }

    async post(url, params = {}, headers = {}) {

        if (this.userAgent && !headers['user-agent']) headers['user-agent'] = this.userAgent;
        headers['Content-Type'] = 'application/json';

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(params),
        });
        // for (let i of response.headers.entries()) {
        //     console.log(i);
        // }

        return {
            statusCode: response.status,
            data: await response.json(),
            headers: response.headers
        }
    }

    async delete(url, params = {}, headers = {}) {

        if (!headers['user-agent']) {
            headers['user-agent'] = this.userAgent;
        }

        let response = await this.api.delete(url, {headers});
        return {
            data: response.data,
            headers: response.headers
        }
    }
}