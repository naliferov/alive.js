import BaseModel from "./BaseModel.js";

export default class NodesModel extends BaseModel {

    name = 'nodes'

    async getByUserId(userId) {
        return await this.mongoManager.getDb().collection(this.name).findOne({userId});
    }

    async insert(userId, nodes) {
        const userNodes = {userId, nodes};
        const result = await this.mongoManager.getDb().collection(this.name).insertOne(userNodes);
        return result.insertedId;
    }

    async update(userId, nodes) {
        await this.mongoManager.getDb().collection(this.name).updateOne({userId}, {$set: {nodes}});
    }
}