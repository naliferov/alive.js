import MongoManager from "../MongoManager";
import BaseModel from "./BaseModel";

export default class FxsModel extends BaseModel {

    name: string = 'vps'

    async insert(userId, digital_ocean_id) {
        const id = await this.mongoManager.getDb().collection(this.name).insertOne({
            user_id: '',
            do_droplet_id: '',
            token: '',
        });
    }
}