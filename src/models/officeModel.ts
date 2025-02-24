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
    //type: String,
    types: String,
    images: Array<String>,
    documents: Array<String>,
    thumbnails: Array<String>,
    size: number,
    owner: Types.ObjectId,
    views: number,
    visits: number,
    hidden: boolean
}

const officeSchema = new Schema<IOffice>({
    name: { type: String, required: true },
    description: {type: String, required: true},
    location: {type: String, required: true},
    position: {
        type: Schema.Types.ObjectId, 
        ref: 'Pin'},
    tags: {type: [String], default: []},
    //type: {type: String, required: true},
    types: {type: [String], required: true},
    images: {type: [String], required: true},
    thumbnails: {type: [String], required: true},
    documents: {type: [String], default: []},
    price: { type: Number },
    size: { type: Number, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the users _id
    views: { type: Number, default: 0},
    visits: {type: Number, default: 0},
    hidden: {type: Boolean, default: false}
})

officeSchema.index({name: "text", location: "text"})

officeSchema.pre('findOneAndDelete', async function (next) {
  try {
    const query = this; // `this` refers to the query
    const office = await query.model.findOne(query.getQuery());
    if (office) {
        await mongoose.model("Pin").deleteOne({ _id: office.position });
        await mongoose.model('savedoffice').deleteMany({ office: office._id });
    }
    next();
  } catch (err) {
    next();
  }
});

const Office = mongoose.model<IOffice>('Office', officeSchema);
export default Office