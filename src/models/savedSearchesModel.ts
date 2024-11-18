import mongoose, { Schema, Types } from "mongoose";

interface ISavedSearch extends Document {
    user: Types.ObjectId
    searchString: string;
}

const savedSearchSchema = new Schema<ISavedSearch>({
    searchString: {type: String, required: true}, 
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Reference to the users _id
})

const SavedSearch = mongoose.model<ISavedSearch>('SavedSearch', savedSearchSchema);
export default SavedSearch