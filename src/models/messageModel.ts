import mongoose, { Document, Schema, Types } from 'mongoose'

interface IMessage extends Document {
    sender: Types.ObjectId;
    conversation: Types.ObjectId;
    message: string;
}

const MessageSchema = new Schema<IMessage>({
    sender: {type: Schema.Types.ObjectId, requried: true},
    conversation: {type: Schema.Types.ObjectId, required: true},
    message: {type: String, required: true},
})

const Message = mongoose.model<IMessage>('Model', MessageSchema)
export default Message