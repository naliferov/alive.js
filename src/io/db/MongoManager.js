import {MongoClient} from "mongodb";

export default class MongoManager {

    conf;
    client;
    db;
    logger;

    createMongoClient(conf, logger) {
        this.conf = conf;
        // @ts-ignore
        const uri = `mongodb+srv://${conf.username}:${conf.password}@cluster0.17igt.mongodb.net/${conf.database}?retryWrites=true&w=majority`;
        this.client = new MongoClient(uri);
        this.logger = logger;
        return this;
    }

    async connect() {
        try {
            await this.client.connect();
            this.db = await this.client.db(this.conf.database);
            await this.db.command({ ping: 1 });
        } catch (e) {
            await this.logger.error('Mongo connection error', e);
            await this.client.close();
        }
    }

    getDb() { return this.db; }
}