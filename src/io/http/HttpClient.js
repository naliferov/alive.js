import {AxiosInstance, default as axios} from 'axios';

export default class HttpClient {

    userAgent: string = '';
    api: AxiosInstance;

    constructor(baseURL: string = '', headers: {} = {}) {

        headers['Content-Type'] = 'application/json';
        //if (token) {
        //    headers['Authorization'] = `Bearer ${token}`
        //}
        this.api = axios.create({baseURL, headers});
    }

    async get(url: string, params: {} = {}, headers = {}) {

        if (this.userAgent && !headers['user-agent']) {
            headers['user-agent'] = this.userAgent;
        }

        let response = await this.api.get(url, {headers, params});
        return {
            statusCode: response.status,
            data: response.data,
            headers: response.headers
        }
    }

    async post(url: string, params: {} = {}, headers: {} = {}) {

        if (this.userAgent && !headers['user-agent']) {
            headers['user-agent'] = this.userAgent;
        }

        let response = await this.api.post(url, params, {headers});
        return {
            data: response.data,
            headers: response.headers
        }
    }

    async delete(url: string, params: {} = {}, headers: {} = {}) {

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