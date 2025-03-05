import mongoose, { Schema } from "mongoose"

interface IArtice extends Document {
    title: string,
    image: string,
    content: string,
    author: string
}

const articleSchema: Schema<IArtice> = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: String, required: true}
})

const Article = mongoose.model<IArtice>("Article", articleSchema)

export default Article