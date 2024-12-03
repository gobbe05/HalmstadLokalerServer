import {Request, Response} from 'express'
import Conversation from '../models/conversationModel'
import { IUser } from '../models/userModel'
import { MongooseError } from 'mongoose'
import handleMongooseError from '../utils/errorHandler'


// GET /api/conversation/
export const getAllConversations = async (req: Request, res: Response) => {
    const userid = (req.user as IUser)._id
    try {
        const conversations = await Conversation.find({$or: [{broker: userid}, {buyer: userid}]})
        return res.status(200).json({status: "OK", conversations})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// DELETE /api/conversation/:id
export const deleteConversation = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const deletedConversation = await Conversation.deleteOne({_id: id, $or: [{buyer: (req.user as IUser)._id}, {broker: (req.user as IUser)._id}]})
        if(deletedConversation.deletedCount == 0) return res.status(404).json({status: "Not Found", msg: "Couldn't find a conversation to delete"});
        return res.status(200).json({status: "OK", msg: "Deleted conversation"});
    } catch(error) {
        handleMongooseError(error as MongooseError, res)
    }
}