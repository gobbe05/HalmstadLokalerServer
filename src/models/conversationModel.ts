import mongoose, {Document, Schema, Types} from 'mongoose'

interface IConversation extends Document {
    broker: Types.ObjectId,
    buyer: Types.ObjectId,
    subject: string;
}

const ConversationSchema = new mongoose.Schema<IConversation>({
    broker: {type: Schema.Types.ObjectId, required: true},
    buyer: {type: Schema.Types.ObjectId, required: true},
    subject: {type: String, required: true}
})

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema)
export default Conversation