import {Db, MongoClient} from "mongodb";
import Logger from "../../log/Logger";

export default class MongoManager {

    conf: {};
    client: MongoClient;
    db: Db;
    logger: Logger;

    createMongoClient(conf: object, logger: Logger) {
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
            // @ts-ignore
            this.db = await this.client.db(this.conf.database);
            await this.db.command({ ping: 1 });
        } catch (e) {
            await this.logger.error('Mongo connection error', e);
            await this.client.close();
        }
    }

    getDb(): Db {
        return this.db;
    }
}