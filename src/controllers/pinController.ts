import {Response, Request} from 'express'
import Pin from '../models/pinModel'

export const getAllPins = async (req: Request, res: Response) => {
    const pins = await Pin.find({})
    if(!pins) return res.status(404).json({msg: "No pins were found"});

    return res.status(200).json({status: "OK", pins})
}