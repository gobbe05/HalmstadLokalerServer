import { Request, Response} from 'express'
import Conversation from '../models/conversationModel'
import User, { IUser } from '../models/userModel'
import handleMongooseError from '../utils/errorHandler'
import { MongooseError } from 'mongoose'
import Message from '../models/messageModel'

// GET /api/message/all
export const getAllMessages = async (req: Request, res: Response) => {
    const conversations = await Conversation.find({})
    const messages = await Message.find({})

    return res.status(200).json({status: "OK", messages, conversations})
}

// GET /api/message/:id

export const getMessages = async (req: Request, res: Response) => {
    const {id} = req.params
    
    try {
        // Check access to conversation
        const userid = (req.user as IUser)._id
        const testConversation = await Conversation.findOne({_id: id, $or: [{broker: userid}, {buyer: userid}]})
        if(!testConversation) return res.status(403).json({status: "Forbidden", msg: "You don't have access to this conversation"});

        const messages = await Message.find({conversation: id})
        return res.status(200).json({status: "OK", messages})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /api/message/latest/:id
export const getLatestMessage = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        // Check access to conversation
        const userid = (req.user as IUser)._id
        const testConversation = await Conversation.findOne({_id: id, $or: [{broker: userid}, {buyer: userid}]})
        if(!testConversation) return res.status(403).json({status: "Forbidden", msg: "You don't have access to this conversation"});

        const message = await Message.findOne({conversation: id})
        if(!message) return res.status(404).json({status: "Not Found", msg: "Can't find latest message"})
        return res.status(200).json({status: "OK", message})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
    const {message, conversation} = req.body
    try {
        if(!message) return res.status(400).json({status: "Bad Request", msg: "Message can't be empty"})

        // Check access to conversation
        const userid = (req.user as IUser)._id
        const testConversation = await Conversation.findOne({_id: conversation, $or: [{broker: userid}, {buyer: userid}]})
        if(!testConversation) return res.status(403).json({status: "Forbidden", msg: "You don't have access to this conversation"});

        // Create message
        const newMessage = new Message({
            sender: userid,
            conversation,
            message
        })
        const newMessage2 = newMessage.save()

        return res.status(200).json({status: "OK"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/message/first
export const postFirstMessage = async (req: Request, res: Response) => {
    const {message, subject, broker} = req.body

    try {
        // Check that broker exists
        const testBroker = await User.find({_id: broker})
        !testBroker && res.status(400).json({status: "Bad Request", msg: "Broker doesn't exist"})

        // Create conversation 
        const newConversation = new Conversation({
            broker,
            buyer: (req.user as IUser)._id,
            subject
        })
        const conversation = await newConversation.save()
        
        // Create first message
        const newMessage = new Message({
            sender: (req.user as IUser)._id,
            conversation: conversation._id,
            message: message
        })
        await newMessage.save()

        return res.status(200).json({status: "OK", conversation: conversation._id})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}
