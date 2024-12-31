import mongoose, {Document, Schema, Types} from "mongoose"

export interface ISavedOffice extends Document {
    user: Types.ObjectId,
    office: Types.ObjectId
}

const savedOfficeSchema = new Schema<ISavedOffice>({
    user: {type: Schema.Types.ObjectId, ref: "User", requried: true},
    office: {type: Schema.Types.ObjectId, ref: "Office", required: true}
})

const SavedOffice = mongoose.model<ISavedOffice>("savedoffice", savedOfficeSchema)

export default SavedOffice