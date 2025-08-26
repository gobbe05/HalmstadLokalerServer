import {NextFunction, Request, Response} from "express"
import User, { IUser } from "../models/userModel"
import { MongooseError } from "mongoose"
import handleMongooseError from "../utils/errorHandler"
import passport from "passport"
import maskEmail from "../utils/maskEmail"
import maskPhone from "../utils/maskPhone"
import CleanPhoneNumber from "../utils/cleanPhoneNumber"

// GET /api/auth/
export const getAuth = async (req: Request, res: Response) => {
    return res.status(200).json({status: "OK",isAdmin: (req.user as IUser).admin,message: "Authenticated", type: (req.user as IUser).type, _id: (req.user as IUser)._id})
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
    const {search} = req.params
    try {
        const user = await User.findOne({$or: [{username: search}, {_id: search}]})
        if(!user)
            return res.status(404).json({status: "Not Found", message: "User not found"});

        // If not admin and not the user themselves, mask email and phone
        if(!req.user || !(req.user as IUser).admin && (req.user as IUser)._id.toString() !== user._id.toString()){
            return res.status(200).json({status: "OK", user: {
                username: user.username, 
                type: user.type, 
                _id: user._id, 
                email: maskEmail(user.email), 
                phoneNumber: maskPhone(user.phoneNumber || ""),
                firstName: user.firstName,
                lastName: user.lastName,}})  
        }
        return res.status(200).json({status: "OK", user})
    } catch(e){
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /api/auth/toaccept
export const getToAccept = async (req: Request, res: Response) => {
    try {
        const users = await User.find({accepted: {$ne: true}})
        const acceptedUsers = await User.find({accepted: true})
        return res.status(200).json({status: "OK", users, acceptedUsers})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /auth/username/:id
export const getUsername = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const user = await User.findOne({_id: id})
        if(!user)
            return res.status(404).json({status: "Not found", message: "User not found"});
        return res.status(200).json({status: "OK", username: user.username})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /auth/email/:id
export const getEmail = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const user = await User.findOne({_id: id})
        if(!user)
            return res.status(404).json({status: "Not found", message: "User not found"});
        return res.status(200).json({status: "OK", email: user.email})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /auth/phone/:id
export const getPhone = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const user = await User.findOne({_id: id})
        if(!user)
            return res.status(404).json({status: "Not found", message: "User not found"});
            return res.status(200).json({status: "OK", phoneNumber: user.phoneNumber})
    } catch(e) {
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
    // Normalize email and username before authentication
    if(req.body.email) req.body.email = req.body.email.toLowerCase();
    if(req.body.username) req.body.username = req.body.username.toLowerCase();

    passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) return next(err);
        if(!user) return res.status(400).json({status: "Bad Request", message: info.message});
        if(!user.accepted) return res.status(403).json({status: "Forbidden", message: "User not accepted by admin"})

        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.status(200).json({status: "OK", _id: user._id, type: user.type, message: "Logged in successfully"})
        })
    })(req, res, next)
}

// POST /api/auth/register/
export const postRegister = async (req: Request, res: Response) => {
    let {
        username, 
        email, 
        password, 
        confirmPassword, 
        accountType, 
        firstName, 
        lastName,
        phoneNumber,
        companyName, 
        orgNr, 
        invoiceAddress
    } = req.body

    // Normalize
    if (email) email = email.toLowerCase();
    if (username) username = username.toLowerCase();

    try {
        // Validate required fields
        if(password !== confirmPassword)
            return res.status(400).json({status: "Bad Request", message: "Passwords do not match"});
        if(!username || !email || !password || !confirmPassword || !accountType)
            return res.status(400).json({status: "Bad Request", message: "All fields are required"});
        if(accountType === "seller" && (!firstName || !lastName || !phoneNumber || !companyName || !orgNr || !invoiceAddress))
            return res.status(400).json({status: "Bad Request", message: "All fields are required for seller account"});
        if(!["buyer", "seller"].includes(accountType))
            return res.status(400).json({status: "Bad Request", message: "Invalid account type"});
        if(!/^[a-zA-Z0-9_]+$/.test(username))
            return res.status(400).json({status: "Bad Request", message: "Username can only contain letters, numbers and underscores"});
        if(!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email))
            return res.status(400).json({status: "Bad Request", message: "Invalid email format"});
        /*Test phone*/
        if(phoneNumber && !/^\+?[0-9\s]+$/.test(phoneNumber))
            return res.status(400).json({status: "Bad Request", message: "Invalid phone number format"});
        if(password.length < 6) 
            return res.status(400).json({status: "Bad Request", message: "Password must be at least 6 characters long"});

        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser) {
            return res.status(403).json({
                status: "Forbidden",
                message: existingUser.email === email ? "Email already exists" : "Username already exists"
            });
        }

        // Only now construct the user object
        const newUser = accountType === "buyer" ? 
            new User({username, email, password, type: accountType})
            :
            new User({
                username,
                email,
                password,
                type: accountType,
                firstName,
                lastName,
                phoneNumber,
                companyName,
                orgNr,
                invoiceAddress
            });

        await newUser.save();

        return res.status(200).json({status: "OK", message: "User created successfully. Waiting to be accepted by an admin"});
    } catch(e) {
        handleMongooseError(e as MongooseError, res);
    }
}

// POST /api/auth/register/validateFirst
export const postValidateFirst = async (req: Request, res: Response) => {
    let {email, username} = req.body
    const {password, confirmPassword, accountType} = req.body;
    if(email) email = email.toLowerCase();
    if(username) username = username.toLowerCase();

    try {
        // Validate required fields
        // Check that fields are not empty
        if(password !== confirmPassword)
            return res.status(400).json({status: "Bad Request", message: "Passwords do not match"});
        if(!username || !email || !password || !confirmPassword || !accountType)
            return res.status(400).json({status: "Bad Request", message: "All fields are required"});
        
        // Check field format
        if(!/^[a-zA-Z0-9_]+$/.test(username))
            return res.status(400).json({status: "Bad Request", message: "Username can only contain letters, numbers and underscores"});
        if(!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(email))
            return res.status(400).json({status: "Bad Request", message: "Invalid email format"});

        const existingUser = await User.findOne({$or: [{username}, {email}]});
        if(existingUser) {
            return res.status(403).json({
                status: "Forbidden",
                message: existingUser.email === email ? "Email already exists" : "Username already exists"
            });
        }
    } catch(e) {
        handleMongooseError(e as MongooseError, res);
    }
    return res.status(200).json({status: "OK", message: "Validation successful"});
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

// PUT /api/auth/user/:id
export const putUser = async (req: Request, res: Response) => {
    const {id} = req.params
    const {firstName, lastName, phoneNumber, invoiceAddress} = req.body
    const cleanedPhoneNumber = CleanPhoneNumber(phoneNumber)
    if(!cleanedPhoneNumber)
        return res.status(400).json({status: "Bad Request", message: "Invalid phone number format"})
    if(!firstName && !lastName && !invoiceAddress && !phoneNumber)
        return res.status(400).json({status: "Bad Request", message: "At least one field is required to update"})
    try {
        if((req.user as IUser)._id.toString() !== id)
            return res.status(401).json({status: "Unauthorized", message: "You can only update your own profile"})
        const user = await User.findByIdAndUpdate(id, {firstName, lastName, invoiceAddress, cleanedPhoneNumber}, {new: true})
        if(!user)
            return res.status(404).json({status: "Not Found", message: "User not found"})
        return res.status(200).json({status: "OK", user})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// PUT /api/auth/accept/:id
export const putAcceptUser = async (req: Request, res: Response) => {
    const {id} = req.params
    try {
        const user = await User.findByIdAndUpdate(id, {accepted: true, acceptDate: new Date()}, {new: true})
        if(!user)
            return res.status(404).json({status: "Not Found", message: "User not found"})
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