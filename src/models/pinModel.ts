import mongoose, {Document, Schema} from 'mongoose'

interface IPin extends Document {
    lng: number,
    lat: number
}

const pinSchema = new Schema<IPin>({
    lng: {type: Number, required: true},
    lat: {type: Number, required: true}
})

const Pin = mongoose.model<IPin>('Pin', pinSchema) 
export default Pin