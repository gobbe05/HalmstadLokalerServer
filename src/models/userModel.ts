// models/userModel.ts
import mongoose, { Model, Schema, Document, Types } from "mongoose"
import { SALT_ROUNDS } from "../config"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
    _id: Types.ObjectId,
    username: string,
    email: string,
    password: string,
    type: string,
    admin: boolean,
    accepted: boolean,
    acceptDate?: Date,
    // Add seller fields
    firstName?: string,
    lastName?: string,
    phoneNumber?: string,
    companyName?: string,
    orgNr?: string,
    invoiceAddress?: string,

    comparePassword: (password: string) => Promise<boolean>
}

const userSchema: Schema<IUser> = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, "Username is required"], 
        unique: true, 
        minlength: [3, "Username must be at least 3 characters"],
        maxLength: [20, "Username cannot exceed 20 characters"],
        lowercase: true
    },
    email: {
        type: String, 
        required: [true, "Email is required"], 
        unique: true,
        lowercase: true
    },
    password: {type: String, required: [true, "Password is required"]},
    type: {type: String, required: [true, "Account type is required"]},
    admin: {type: Boolean, default: false},
    accepted: {type: Boolean, default: false, required: [true, "Acceptance status is required"]},
    acceptDate: {type: Date, required: false},
    // Add seller fields
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    companyName: { type: String, required: false },
    orgNr: { type: String, required: false },
    invoiceAddress: { type: String, required: false }
})

userSchema.pre("save", async function (next) {
    if(this.isModified && this.isModified("password") || this.isNew) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS)
        this.password = await bcrypt.hash(this.password, salt)
    }
    next();
})

userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
}

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema)
export default User