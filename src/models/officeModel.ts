import mongoose, { Document, Schema, Types } from 'mongoose';
import ICoordinates from '../interfaces/ICoordinates';
import '../models/pinModel';

export interface IOffice extends Document {
    name: string,
    description: string,
    location: string,
    position: ICoordinates,
    price: number,
    tags: Array<string>,
    type: String,
    image: String,
    thumbnail: String,
    size: number,
    owner: Types.ObjectId,
    views: number,
    visits: number
}

const officeSchema = new Schema<IOffice>({
    name: { type: String, required: true },
    description: {type: String, required: true},
    location: {type: String, required: true},
    position: {
        type: Schema.Types.ObjectId, 
        ref: 'Pin'},
    tags: {type: [String], default: []},
    type: {type: String, required: true},
    image: {type: String, required: true},
    thumbnail: {type: String, required: true},
    price: { type: Number },
    size: { type: Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the users _id
    views: { type: Number, default: 0},
    visits: {type: Number, default: 0}
})

officeSchema.index({name: "text", location: "text"})

const Office = mongoose.model<IOffice>('Office', officeSchema);
export default Office