export default class BaseModel {

    name;
    mongoManager;

    constructor(mongoManager) {
        this.mongoManager = mongoManager;
    }
}