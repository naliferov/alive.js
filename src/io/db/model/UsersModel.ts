import BaseModel from "./BaseModel";

export default class UsersModel extends BaseModel {

    name = 'users';

    async insert(email: string, password: string, authKey: string) {
        const user = {email, password, authKey};
        const result = await this.mongoManager.getDb().collection(this.name).insertOne(user);
        return result.insertedId;
    }

    async getByEmail(email: string) {
        return await this.mongoManager.getDb().collection(this.name).findOne({email});
    }

    async getByAuthKey(authKey: string) {
        return await this.mongoManager.getDb().collection(this.name).findOne({authKey});
    }
}