import BaseModel from "./BaseModel.js";

export default class UsersModel extends BaseModel {

    name = 'users';

    async insert(email, password, authKey) {
        const user = {email, password, authKey};
        const result = await this.mongoManager.getDb().collection(this.name).insertOne(user);
        return result.insertedId;
    }

    async getByEmail(email) {
        return await this.mongoManager.getDb().collection(this.name).findOne({email});
    }

    async getByAuthKey(authKey) {
        return await this.mongoManager.getDb().collection(this.name).findOne({authKey});
    }
}