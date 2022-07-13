//import express from 'express';
let x = {};

x['main.imports'] = async () => {
    return {
        fs: await import('node:fs'),
    };
}
x['main'] = async () => {
    let someClass = await x['io.HttpServer']();

    console.log(typeof x);
    console.log(class A {});
    console.log(someClass);
    console.log(x['io.HttpMsgHandler']);
    console.log(function () {});
    console.log(1 / 'str');
}

x['io.HttpServer.imports'] = async () => {
    return {
        http: (await import('node:http')).default,
        express: (await import('express')).default
    };
}

x['io.HttpServer'] = async () => {

    const {http, express} = await x['io.HttpServer.imports']();
    console.log(express);

    //console.log(http);
    //console.log(Object.keys(express));

    class Class3 {
        constructor() {
            this.a = 1;
        }
    }

    return Class3;
}

x['io.HttpMsgHandler'] = class {
    handleMsg(req, res, next) {}
}


await x['io.HttpServer']();

x.main();