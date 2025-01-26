import {Request, Response} from 'express'
import handleMongooseError from '../utils/errorHandler'
import { MongooseError } from 'mongoose'
import SavedSearch from '../models/savedSearchesModel'
import { IUser } from '../models/userModel'

// GET /api/savedsearch
export const getSavedSearch = async (req: Request, res: Response) => {
    try {
        const savedSearches = await SavedSearch.find({user: (req.user as IUser)._id})
        if(!savedSearches.length) return res.status(204).json({status: "No Content", msg: "You don't have any saved searches"});
        return res.status(200).json({status: "OK", savedSearches})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }

}
// GET /api/savedsearch/insavedsearch?search=xxx
export const getIfInSavedSearch = async (req: Request, res: Response) => {
    try {
        const {search} = req.query
        const savedSearches = await SavedSearch.find({searchString: search, user: (req.user as IUser)._id})
        if(!savedSearches.length) return res.status(200).json({status: "OK", inSavedSearch: false});
        return res.status(200).json({status: "OK", inSavedSearch: true})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/savedsearch/toggle
export const postSavedSearchToggle = async (req: Request, res: Response) => {
    const {search} = req.body
    console.log(req.body)
    if(!search) return res.status(400).json({status: "Bad Request"})
    try {
        const savedSearch = await SavedSearch.findOne({searchString: search, user: (req.user as IUser)._id})
        if(savedSearch) {
            const deletedSavedSearch = await SavedSearch.findOneAndDelete({searchString: search, user: (req.user as IUser)._id})
            if(!deletedSavedSearch) return res.status(500).json({status: "Internal Server Error"})
            return res.status(200).json({status: "OK", msg: "Removed saved search"})
        }
        const newSavedSearch = new SavedSearch({
            searchString: search,
            user: (req.user as IUser)._id
        })
        await newSavedSearch.save()
        return res.status(200).json({status: "OK", msg: "Added saved search"})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/savedsearch
export const postSavedSearch = async (req: Request, res: Response) => {
    const {searchString} = req.body
    if(!searchString) return res.status(400).json({status: "Bad Request", msg: "searchString requrired"})
    try {
        const newSavedSearch = new SavedSearch({
            searchString,
            user: (req.user as IUser)._id
        })
        const savedSavedSearch = newSavedSearch.save()
        if(!savedSavedSearch) return res.status(500).json({status: "Internal Server Error", msg: "There was an error creating the savedSearch"})
        return res.status(200).json({status: "OK", newSavedSearch: savedSavedSearch})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    } 
}

// DELETE /api/savedsearches
export const deleteSavedSearch = async (req: Request, res: Response) => {
    return res.status(200)
}