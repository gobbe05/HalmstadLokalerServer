import {Request, Response} from 'express'
import Office from '../models/officeModel';
import { IUser } from '../models/userModel';
import handleMongooseError from '../utils/errorHandler';
import { MongooseError } from 'mongoose';

// GET /api/statistics/views

export const getAllViews = async (req: Request, res: Response) => {
    try {
        // Fetch documents matching the filter
        const documents = await Office.find({owner: (req.user as IUser)._id});

        // Calculate the total views
        const totalViews = documents.reduce((sum, doc) => sum + doc.views, 0);
        return res.status(200).json({status: "OK", views: totalViews})
    } catch(error) {
        handleMongooseError(error as MongooseError, res)
    }
}

// GET /api/statistics/visits
export const getAllVisits = async (req: Request, res: Response) => {
    try {
        // Fetch documents matching the filter
        const documents = await Office.find({owner: (req.user as IUser)._id})

        const totalVisits = documents.reduce((sum, doc) => sum + doc.visits, 0)
        return res.status(200).json({status: "OK", visits: totalVisits})
    } catch(error) {
        handleMongooseError(error as MongooseError, res)
    }
}

// GET /api/statistics/offices

export const getOfficeCount = async (req: Request, res: Response) => {
    try {
        // Get office count
        const count = await Office.countDocuments({owner: (req.user as IUser)._id})
        return res.status(200).json({status: "OK", count})
    } catch(error) {
        handleMongooseError(error as MongooseError, res)
    }
}