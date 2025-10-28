import { Request, Response} from 'express'
import { IUser } from '../models/userModel'
import handleMongooseError from '../utils/errorHandler'
import { MongooseError, Types } from 'mongoose'
import Message from '../models/messageModel'
import { sendEmail } from '../utils/email'

// GET /api/message/all
export const getAllMessages = async (req: Request, res: Response) => {
    const messages = await Message.find({})

    return res.status(200).json({status: "OK", messages})
}

// GET /api/message
export const getMessages = async (req: Request, res: Response) => {
    const userid = (req.user as IUser)._id
    try {
        // TODO // Sort result
        const messages = await Message.find({receiver: userid})
        return res.status(200).json({status: "OK", messages})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}
// /api/message/sent/:id
export const getSentMessages = async (req: Request, res: Response) => {
    const userid = (req.user as IUser)._id
    try {
        // TODO // Sort result
        const messages = await Message.find({sender: userid})
        return res.status(200).json({status: "OK", messages})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}
// GET /api/message/:id
export const getMessage = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const userid = (req.user as IUser)._id
        const message = await Message.findOne({_id: id})
        if(!message) return res.status(404).json({status: "Not Found", msg: "Message couldn't be found"});
        if(!new Types.ObjectId(userid).equals(message.receiver) && !new Types.ObjectId(userid).equals(message.sender)) 
            return res.status(401).json({status: "Unauthorized", msg: "You don't have access to this message"});
        return res.status(200).json({status: "OK", message})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/message
export const postMessage = async (req: Request, res: Response) => {
    const {message, email, phone, company, receiver} = req.body
    try {
        const userid = (req.user as IUser)?._id || "";
        const userType = (req.user as IUser)?.type || "";
        const userFirstName = (req.user as IUser)?.firstName || "en intressent";

        if(!message) return res.status(400).json({status: "Bad Request", msg: "Message can't be empty"})
        if(!email) return res.status(400).json({status: "Bad Request", msg: "Email can't be empty"})
        if(!phone) return res.status(400).json({status: "Bad Request", msg: "Phone number can't be empty"})
        if(!company) return res.status(400).json({status: "Bad Request", msg: "Company name can't be empty"})
        if(userid == receiver) return res.status(400).json({status: "Bad Request", msg: "You can't send a message to yourself"})
        if(userType == "seller") return res.status(401).json({status: "Unauthorized", msg: "You can't be a seller to send messages"})

        // Create message
        const newMessage = new Message({
            sender: userid || null,
            receiver,
            message,
            email,
            company,
            phone
        })
        await newMessage.save()
        sendEmail({
            to: email,
            subject: "Nytt meddelande mottaget",
            html: `<p>Du har fått ett nytt meddelande från ${userFirstName}!</p><p>Logga in på <a href="https://halmstadlokaler.se">HalmstadLokaler</a> för att läsa meddelandet.</p>`
        })

        return res.status(200).json({status: "OK"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// DELETE /api/message/:id
export const deleteMessage = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const userid = (req.user as IUser)._id
        const message = await Message.findOneAndDelete({_id: id, receiver: userid})
        if(!message) return res.status(404).json({status: "Not Found", msg: "Message couldn't be found"});
        return res.status(200).json({status: "OK", message})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

/* This type of message logic is not used/needed anymore */
/*
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
// POST /api/message/first
export const postFirstMessage = async (req: Request, res: Response) => {
    const {message, subject, broker} = req.body

    try {
        // Check that user is a buyer
        if((req.user as IUser).type != "buyer") return res.status(401).json({status: "Unauthorized", msg: "Bara köpare kan starta en konversation"})

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
*/