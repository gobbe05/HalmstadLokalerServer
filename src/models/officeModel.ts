import mongoose, { Document, Schema, Types } from 'mongoose';
import ICoordinates from '../interfaces/ICoordinates';
import '../models/pinModel';

interface IOffice extends Document {
    name: string,
    location: string,
    position: ICoordinates,
    price: number,
    tags: Array<string>,
    image: String,
    size: number,
    owner: Types.ObjectId
}

const officeSchema = new Schema<IOffice>({
    name: { type: String, required: true },
    location: {type: String, required: true},
    position: {
        type: Schema.Types.ObjectId, 
        ref: 'Pin'},
    tags: {type: [String], default: []},
    image: {type: String, required: true},
    price: { type: Number },
    size: { type: Number, requried: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the users _id
})

officeSchema.index({name: "text", location: "text"})

const Office = mongoose.model<IOffice>('Office', officeSchema);
export default Office