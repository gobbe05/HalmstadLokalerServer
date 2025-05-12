import {Request, Response} from 'express';
import handleMongooseError from '../utils/errorHandler';
import User from '../models/userModel';
import { MongooseError } from 'mongoose';

// GET /api/seller
export const getAllSellers = async (req: Request, res: Response) => {
    try {
        const sellers = await User.find({type: "seller"})
        if (!sellers.length) return res.status(204).json({ status: 'No Content', msg: 'No sellers found' });
        return res.status(200).json({ status: 'OK', sellers });
    } catch (e) {
        handleMongooseError(e as MongooseError, res);
    }
}