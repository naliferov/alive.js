import MongoManager from "../MongoManager";

export default class BaseModel {

    name: string
    mongoManager: MongoManager;

    constructor(mongoManager: MongoManager) {
        this.mongoManager = mongoManager;
    }
}