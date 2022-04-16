//u1({}, ['s', ''], ['f', ''])

export const guid = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
export const uuid = () => guid();

export const randBytes = async (length) => {
    const {randomBytes} = require('crypto');
    return randomBytes(length).toString('hex');
}

export let cloneObject = (object: any): object => {

    if (Array.isArray(object)) {
        let array = [];
        for (let i = 0; i < object.length; i++) {

            let v = object[i];
            let valueType = typeof v;

            if (valueType === 'function') continue;
            if (valueType === 'object' && valueType !== null) {
                array.push(cloneObject(v));
            } else {
                array.push(v);
            }
        }

        return array;
    }

    let clone = {};
    for (let k in object) {

        let v = object[k];
        let valueType = typeof v;

        if (valueType === 'function') continue;
        if (valueType === 'object' && valueType !== null) {
            clone[k] = cloneObject(v);
        } else {
            clone[k] = v;
        }
    }

    return clone
}

export let callWithDelay = (fn: any, delay: any): Promise<null> => {
    return new Promise<any>((resolve) => {
        setTimeout(async () => {
            await fn()
            resolve(null)
        }, delay);
    });
}

export let chain = (x) => {
    return (f) => {
        if (!f) return x;
        return chain( f(x) );
    };
}

export let getValueByPath = (object: object, path: string) => {
    let keys = path.split('.');
    let lastValue = object;

    for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (keys.length === 0) {
            return {object: lastValue, key: key};
        }
        if (!lastValue[key] || typeof lastValue[key] !== 'object') {
            lastValue[key] = {};
        }
        lastValue = lastValue[key];
    }
}

export let exec = async (m) => {
    return new Promise((resolve) => {
        const {spawn} = require('child_process');
        const ls = spawn(m.cmd, m.args, {cwd: m.cwd});
        ls.stdout.on('data', (data) => console.log(data.toString().trim()));
        ls.stderr.on('data', (data) => console.log(`E: ${data.toString().trim()}`));
        ls.on('close', (code) => resolve({code}));
    });
}

export let fl = (path) => {
    let p = require('util').promisify; let fs = require('fs');
    return {
        r: async () => await p(fs.readFile)(path, 'utf8'),
        w: async (data) => await p(fs.writeFile)(path, data, 'utf8')
    };
}

export let fSet = (path) => {
    let file = fl(path);
    let rFile = async () => JSON.parse(await file.r());
    return {
        a: async (k) => (await rFile())[k],
        w: async (k, v) => { let set = await rFile(); set[k] = v; await file.w(JSON.stringify(set)); },
        d: async (k) => { let set = await rFile(); delete set[k]; await file.w(JSON.stringify(set)); }
    };
}

export const getTimestamp = (): string => {
    const dt = new Date();
    let year = dt.getFullYear().toString().padStart(4, '0');
    let day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth()+1).toString().padStart(2, '0')

    return `${year}-${month}-${day} ${
        dt.getHours().toString().padStart(2, '0')}:${
        dt.getMinutes().toString().padStart(2, '0')}:${
        dt.getSeconds().toString().padStart(2, '0')}`;
}

export let idGenerator = () => {
    return () => {
        let id = BigInt ? BigInt(0) : 0
        return () => ++id
    }
}

export const parseCliArgs = (cliArgs: string[]) => {

    const args = {};

    for (let i = 0; i < cliArgs.length; i++) {
        if (i < 2) continue; //skip node scriptName args

        let arg = cliArgs[i];
        let [k, v] = arg.split('=');
        if (!v) {
            args[i - 2] = arg; //start write args from main 0
            continue;
        }
        k = k.slice(2); //remove "--" characters
        args[k.trim()] = v.trim();
    }

    return args;
}

export const u = async (...arg) => { console.log(arg[0]); }

/*static isExists(varForCheck: any): boolean {
    return typeof varForCheck !== 'undefined'
}

static isObject(obj: any): boolean {
    return typeof obj === 'object' && !ObjectChunk.isArray(obj) && obj !== null
}

static isObjectEmpty(obj: object) {
    return Object.entries(obj).length === 0 && obj.constructor === Object
}

static isObjectsHasFullIntersect(searchObject: object, object: any) {

    for (let key in searchObject) {
        if (!searchObject.hasOwnProperty(key)) continue;

        if (!object[key]) return false;
    }

    return true;
}

static getObjectPropertyCount(obj: object) {
    return Object.entries(obj).length;
}

static iterateArray(arrayToIterate: [], callback: any) {
    for (let i = 0; i < arrayToIterate.length; i++) callback(i, arrayToIterate[i])
}

static iterateArrayReverse = (arrayToIterate: [], callback: any) => {
    for (let i = arrayToIterate.length - 1; i >= 0; i--) callback(i, arrayToIterate[i]);
}

static iterate(objectToIterate: {[key: string]: any}, callback: any) {

    if (ObjectChunk.isArray(objectToIterate)) {

        for (let i = 0; i < objectToIterate.length; i++) {
            callback(i, objectToIterate[i]);
        }

    } else {
        for (let i in objectToIterate) {
            callback(i, objectToIterate[i]);
        }
    }
}*/

/*static iterateAsync = async (object: any, callback: any) => {
    object[Symbol.asyncIterator] = async function* () {
        for (let key in this) yield {key: key, value: this[key]}
    }
    for await (let item of object) {
        await callback(item.key, item.value)
    }
}*/

/*static isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

static unixTs() {
    return Math.floor(Date.now() / 1000)
}

static getTimestampFromUnixTs(unixTs: number): string|null {

    var dt = new Date(unixTs * 1000);
    let year = dt.getFullYear().toString().padStart(4, '0');
    let day = dt.getDate().toString().padStart(2, '0');
    const month = (dt.getMonth()+1).toString().padStart(2, '0')

    return `${year}-${month}-${day} ${
        dt.getHours().toString().padStart(2, '0')}:${
        dt.getMinutes().toString().padStart(2, '0')}:${
        dt.getSeconds().toString().padStart(2, '0')}`;
}

static setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
static getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
static eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
}*/

/*export default async () => {

    let f = {}

    f.isPrimitive = (arg) => {
        const type = typeof arg;
        return arg === null || (type !== 'object' && type !== 'function');
    }
    f.log = (msg, color) => {
        let preColorStr = '';
        let postColorStr = '';

        if (color === 'red') {
            preColorStr = '\x1b[31m';
            postColorStr = '\x1b[0m';
        }

        if (color) {
            console.log(`${preColorStr}${msg}${postColorStr}`);
        } else {
            console.log(msg);
        }
    }
    f.getCaretPosition = () => {
        return document.getSelection().anchorOffset;
    }
    f.setCaretPosition = (domElement, pos) => {
        let range = document.createRange();
        let sel = window.getSelection();

        range.setStart(domElement.childNodes[0], pos);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }
    f.randInt = (min, max) => {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        return Math.round(rand);
    }
    f.objectGetFirstKey = obj => Object.keys(obj)[0]
    f.objectLength = obj => Object.keys(obj).length
    f.parseCliArgs = (args) => {

        let result = {}

        f.iterate(args, (index, arg) => {
            if (index < 2) return

            let [k, v] = arg.split('=')
            k = k.slice(2);

            result[k.trim()] = v.trim()
        })

        return result
    }
    f.ttl = {
        minute: 60,
        hour: 3600,
    }
    f.unixTs = () => Math.floor(Date.now() / 1000)
    f.searchFullIntersection = (searchObject, searchInObject) => {

        let result = true

        f.iterate(searchObject, (key, value) => {
            if (!searchInObject[key]) {
                result = false
            }
        })

        return result
    }

    return f
}*/

