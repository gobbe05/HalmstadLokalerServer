import {Request, Response, NextFunction} from 'express'
import "../config"
import { Types } from 'mongoose';
import { IUser } from '../models/userModel';
import { TEST_USER_ID } from '../config';

export default function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (process.env.NODE_ENV === 'test') {
        req.user = {
            _id: new Types.ObjectId(TEST_USER_ID),
            username: "gabriel11",
            email: "gabriel11@raskov.se",
        } as IUser
        return next();
    }

    if(req.isAuthenticated()) {
        return next()
    } else {
        return res.status(401).json({msg: "Unauthorized"})
    }
}