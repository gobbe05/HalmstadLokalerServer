import { NextFunction, Request, Response } from "express"
import { IUser } from "../models/userModel"

export default function adminProtection(req: Request, res: Response, next: NextFunction) {
    if((req.user as IUser).admin) {
        return next()
    } else {
        return res.status(403).json({status: "FORBIDDEN", msg: "Forbidden"})
    }

}