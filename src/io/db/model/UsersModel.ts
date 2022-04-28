import BaseModel from "./BaseModel";

export default class UsersModel extends BaseModel {

    name = 'users'

    async insert(user) {
        const id = await this.mongoManager.getDb().collection(this.name).insertOne({
            email: 'canvas',
            password: 100,
            authKey: 100,
        });
    }
}