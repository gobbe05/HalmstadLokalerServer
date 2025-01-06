import mongoose, { Document, Schema, Types } from 'mongoose'

interface IMessage extends Document {
    sender: Types.ObjectId;
    receiver: Types.ObjectId;
    message: string;
    email: string;
    phone: string;
    company: string;
}

const MessageSchema = new Schema<IMessage>({
    sender: {type: Schema.Types.ObjectId, ref: "User", required: true},
    receiver: {type: Schema.Types.ObjectId, ref: "User", required: true},
    message: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
    company: {type: String, required: true}
})

const Message = mongoose.model<IMessage>('Model', MessageSchema)
export default Message