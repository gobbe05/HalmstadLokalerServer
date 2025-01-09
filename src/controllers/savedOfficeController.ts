import {Response, Request} from 'express'
import SavedOffice from '../models/savedOffice';
import { IUser } from '../models/userModel';
import { MongooseError } from 'mongoose';
import handleMongooseError from '../utils/errorHandler';

export const getSavedOffices = async (req: Request, res: Response) => {
    try {
        const savedOffices = await SavedOffice.find({})
        return res.status(200).json({status: "OK", savedOffices})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

export const getSavedOfficesForUser = async (req: Request, res: Response) => {
    const id = (req.user as IUser)._id
  try {
    const offices = await SavedOffice.find({ user: id})
        .populate({
            path: 'office',
            match: {hidden: false}
        }) // Populates the office details
    const visibleOffices = offices.filter(office => office.office !== null)
    return res.status(200).json({status: "OK", offices: visibleOffices});
  } catch (e) {
    handleMongooseError(e as MongooseError, res)
  }
}

export const getSavedOfficeState = async (req: Request, res: Response) => {
    const id = (req.user as IUser)._id
    const {office} = req.params
    try {
        const saveCheck = await SavedOffice.findOne({user:id, office})
        if(saveCheck) return res.status(200).json({status: "OK", saved: true});
        return res.status(200).json({status: "OK", saved: false});
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

export const postSavedOffice = async (req: Request, res: Response) => {
    try {
        const id = (req.user as IUser)._id
        const {office} = req.body
        const checkSavedOffice = await SavedOffice.findOne({user: id, office})
        if(checkSavedOffice) return res.status(400).json({status: "Bad Request", msg: "You have already saved this office"})
        
        const newSavedOffice = new SavedOffice({
            user: id,
            office
        })
        await newSavedOffice.save()
        return res.status(200).json({status: "OK", msg: "Succesfully saved office"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)    
    } 
} 

export const deleteSavedOffice = async (req: Request, res: Response) => {
    try {
        const id = (req.user as IUser)._id
        const {office} = req.params
        
        const removeSave = await SavedOffice.findOneAndDelete({user: id, office: office})
        if(removeSave) return res.status(404).json({status: "Not Found", msg: "Saved office couldn't be found"})

        return res.status(200).json({status: "OK", msg: "Save deleted"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
} 