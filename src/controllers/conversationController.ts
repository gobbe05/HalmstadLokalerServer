import {Request, Response} from 'express'
import Conversation from '../models/conversationModel'
import { IUser } from '../models/userModel'
import { MongooseError } from 'mongoose'
import handleMongooseError from '../utils/errorHandler'

export const getConversations = async (req: Request, res: Response) => {
    const userid = (req.user as IUser)._id
    try {
        const conversations = await Conversation.find({$or: [{broker: userid}, {buyer: userid}]})
        return res.status(200).json({status: "OK", conversations})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}