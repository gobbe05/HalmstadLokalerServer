import { Request, Response } from 'express';
import Office from '../models/officeModel';
import { MongooseError} from 'mongoose';
import handleMongooseError from '../utils/errorHandler';
import { IUser } from '../models/userModel';
import Pin from '../models/pinModel';
import { incrementAndFetchOffices } from '../utils/incrementAndFetchOffices';
import { incrementAndFetchOneOffice } from '../utils/incrementAndFetchOneOffice';
import { uploadImageToS3 } from '../utils/s3client';

// GET /api/office/:id
export const getOffice = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const office = await incrementAndFetchOneOffice({_id: id})

        if(!office) return res.status(404).json({status: "Not Found"})

        return res.status(200).json({status: "OK", office})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /api/office/
// GET /api/office?limit=iii
// GET /api/office?search=sss
// GET /api/office?dontincrement=bool
// GET /api/office?type=string
// GET /api/office?max=iii
// GET /api/office?min=iii
export const getAllOffices = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
        let {search, dontincrement, type, priceMin, priceMax, sizeMin, sizeMax} = req.query
        let offices;

        // Build search query
        let s: any = {$or:[]}
        if(search)
            s.$or = [...s.$or, {name: {$regex: search, $options: "i"}}, {location: {$regex: search, $options: "i"}}, {tags: {$regex: search, $options: "i"}}]
        if(type)
            s = {type: type, ...s}
        if(priceMin || priceMax) {
            let range = {}
            if(priceMax) range = {...range, $lte: priceMax};
            if(priceMin) range = {...range, $gte: priceMin};
            s = {price: range, ...s}
        } 
        if(sizeMin || sizeMax) {
            let range = {}
            if(sizeMax) range = {...range, $lte: sizeMax}
            if(sizeMin) range = {...range, $gte: sizeMin};
            s = {size: range, ...s}
        }
        const searchQuery = s

        // Checks that limit is a number
        if(limit !== undefined && isNaN(limit)) 
            return res.status(400).json({ status: "Bad Request", message: "Limit must be a number" });

        // Check views should be incremented or not
        if(dontincrement === "true")
            offices = limit ? await Office.find(searchQuery).limit(limit) : await Office.find(searchQuery)
        else
            offices = limit ? await incrementAndFetchOffices(searchQuery, limit) : await incrementAndFetchOffices(searchQuery)
        return res.status(200).json({ status: "OK", offices}) // 200 OK
    } catch(e) {
        handleMongooseError(e as MongooseError, res);
    }
}

// GET /api/office/user/:id?limit=x
export const getUserOffices = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {limit} = req.query
        const offices = limit ? await Office.find({owner: id}).limit(+limit) : await Office.find({owner: id})

        if(!offices) return res.status(404).json({status: "Not Found"})

        return res.status(200).json({status: "OK", offices})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// POST /api/office/
export const postOffice = async (req: Request, res: Response) => {
    const { name, description, location, price, size, type, lng, lat, tags } = req.body
    const position = {lng: +lng, lat: +lat}
    let imageUrl = `https://halmstadlokaler.s3.eu-north-1.amazonaws.com/`;

    const file = req.file
    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    if (!name || !description || !location || !position || !position.lng || !position.lat || !size || !type || price == null) {
        return res.status(400).json({status: "Bad Request", message: "Missing required fields"})
    }

     try {
        const bucketName = process.env.S3_BUCKET_NAME!;
        const key = `${Date.now()}-${file.originalname}`;
        await uploadImageToS3(bucketName, key, file.buffer);
        imageUrl += key
    } catch (err) {
        return res.status(500).send({ error: 'Upload failed', details: err });
    }
    try {
        const newPin = new Pin({lng: position.lng, lat: position.lat})
        const pin = await newPin.save()
        if(!pin) return res.status(500).json({status: "Internal error", msg: "There was an error creating pin"})
        const newOffice = new Office({
            name,
            description,
            location,
            position: pin._id,
            image: imageUrl,
            price,
            tags,
            type,
            size,
            owner: (req.user as IUser)._id
        })

        await newOffice.save() 
        return res.status(201).json({ status: "Created Successful", office: newOffice}) // Send 201 Created successful
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// PUT /api/office/:id
export const putOffice = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {name, location, size, price, position} = req.body

        // Dynamically build the update object with only defined fields
        const updateFields: Partial<{ name: string; location: string; size: number; price: number; position: string }> = {};
        
        if (name        !== undefined) updateFields.name = name;
        if (location    !== undefined) updateFields.location = location;
        if (size        !== undefined) updateFields.size = size;
        if (price       !== undefined) updateFields.price = price;
        if (price       !== undefined) updateFields.price = price;

        // Find and update the office document with the constructed updateFields
        const updatedOffice = await Office.findOneAndUpdate(
            {_id: id, owner: (req.user as IUser)._id},
            updateFields,
            {new: true, runValidators: true}
        )

        if(!updatedOffice) return res.status(404).json({status: "Not Found", message: "Don't own office with id"})

        return res.status(200).json({status: "OK",office: updatedOffice})
    } catch(e) {
       handleMongooseError(e as MongooseError, res) 
    }
}

// DELETE /api/office/:id
export const deleteOffice = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const deletedOffice = await Office.findOneAndDelete({ _id: id, owner: (req.user as IUser)._id })
        if(!deletedOffice) return res.status(404).json({status: "Not Found", message: "No ownership of office with id"})
        return res.status(200).json({ status: "OK", office: deletedOffice}) // 200 OK
    } catch(e) {
       handleMongooseError(e as MongooseError, res); 
    } 
}

// DELETE /api/office/all

export const deleteAllOffices = async (req: Request, res: Response) => {
    const empty: any = []
    while(await Office.find({}) != empty) {
        await Office.findOneAndDelete({})
    }
    return res.json(200)
}