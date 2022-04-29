export default class WSClient {

    wsConnection;

    async handleWsMsg (msg) {
        const m = JSON.parse(msg.data);
        console.log(m);
        if (m.streamProcessLog) {

        }
    }

    async connect() {

        return new Promise((resolve, reject) => {
            const wsConnection = new WebSocket(`${document.location.protocol === 'https:' ? 'wss' : 'ws'}://${document.location.host}`)
            wsConnection.onopen = () => {
                resolve(wsConnection);
                this.wsConnection = wsConnection;
            };
            wsConnection.onmessage = (msg) => this.handleWsMsg(msg);
            wsConnection.onerror = (error) => {
                console.log('Ws connection error.', error);
                reject(error);
            };
            wsConnection.onclose = (event) => { console.log('Ws connection closed. Reconnect after 2 seconds'); setTimeout(() => this.connect(), 2000); };
        });
    }

    async send(data) { this.wsConnection.send(JSON.stringify(data)); }
}