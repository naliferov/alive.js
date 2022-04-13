export default class HttpClientB {

    async get(url: string, params: {} = {}): Promise<string|null> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url + '?' + new URLSearchParams(params).toString(), true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.onload = () => resolve(xhr.responseText);
            xhr.send();
        });
    }

    post(url: string, data: {}): Promise<string|null> {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.onload = () => resolve(xhr.responseText);
            xhr.send(JSON.stringify(data));
        });
    }
}