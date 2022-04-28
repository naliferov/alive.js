import BaseModel from "./BaseModel";

export default class ModulesModel extends BaseModel {

    name: string = 'modules'

    async insert(userId, modulesJson) {
        const id = await this.mongoManager.getDb().collection(this.name).insertOne({
            user_id: '',
            modules: '',
        });
    }
}