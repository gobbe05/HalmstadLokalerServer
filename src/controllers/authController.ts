import {NextFunction, Request, Response} from "express"
import User, { IUser } from "../models/userModel"
import { MongooseError } from "mongoose"
import handleMongooseError from "../utils/errorHandler"
import passport from "passport"

// GET /api/auth/
export const getAuth = async (req: Request, res: Response) => {
    return res.status(200).json({status: "OK",message: "Authenticated"})
}

// GET /api/auth/me/
export const getMe = async (req: Request, res: Response) => {
    return res.status(200).json({status: "OK", user: req.user})
}

// GET /api/auth/user/
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
        res.status(200).json({status: "OK", users: users})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
    
}

// GET /api/auth/user/:username
export const getUser = async (req: Request, res: Response) => {
    try {
        const {username} = req.params

        const user = await User.find({username})
        if(!user)
            return res.status(404).json({status: "Not Found", message: "User not found"});

        return res.status(200).json({status: "OK", user})
    } catch(e){
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /api/auth/logout/
export const getLogout = async (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
        if(err) return next(err);
        return res.status(200).json({status: "OK", message: "Logged out"})
    })
}

// POST /api/auth/login/
export const postLogin = async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if(!user) return res.status(400).json({status: "Bad Request", message: info.message});

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({status: "OK", message: "Logged in successfully"})
        })
    })(req, res, next)
}

// POST /api/auth/register/
export const postRegister = async (req: Request, res: Response) => {
    const {username, email, password} = req.body
    try {
        const existingUser = await User.findOne({$or: [{username}, {email}]})
        if(existingUser) {
            return res.status(403).json({
                status: "Forbidden",
                message: existingUser.email === email.toLowerCase() ? "Email already exists" : "Username already exists"})
        }
        const newUser = new User({username, email, password})
        await newUser.save()

        return res.status(200).json({status: "OK", message: "User created successfully"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// PUT /api/auth/changepassword
export const putChangePassword = async (req: Request, res: Response) => {
    const {password, username} = req.body
    try {
        if((req.user as IUser).username != username) 
            return res.status(401).json({status: "Unauthorized"});

        const user = await User.findOne({username})
        if(!user) 
            return res.status(404).json({status: "Not Found", message: "Username not found"})

        user.password = password
        await user.save()

        return res.status(200).json({status: "OK", user})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// DELETE /api/auth/user/:id
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const deleteduser = await User.findByIdAndDelete(id)
        if (!deleteduser) 
            return res.status(404).json({status: "Not Found"});
        return res.status(200).json({status: "OK"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}