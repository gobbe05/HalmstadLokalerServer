import { Request, Response } from 'express';
import Office from '../models/officeModel';
import { MongooseError} from 'mongoose';
import handleMongooseError from '../utils/errorHandler';
import { IUser } from '../models/userModel';
import Pin from '../models/pinModel';
import { incrementAndFetchOffices } from '../utils/incrementAndFetchOffices';
import { incrementAndFetchOneOffice } from '../utils/incrementAndFetchOneOffice';
import uploadImage from '../utils/officeController/uploadImage';
import uploadDocument from '../utils/officeController/uploadDocument';
import { uploadImageToS3 } from '../utils/s3client';
import sharp from 'sharp';

// GET /api/office/:id
export const getOffice = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const office = await incrementAndFetchOneOffice({_id: id, hidden: false})

        if(!office) return res.status(404).json({status: "Not Found"})

        return res.status(200).json({status: "OK", office})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
    }
}

// GET /api/office/
// GET /api/office?limit=iii
// GET /api/office?page=iii
// GET /api/office?search=sss
// GET /api/office?dontincrement=bool
// GET /api/office?type=sss
// GET /api/office?max=iii
// GET /api/office?min=iii
export const getOffices = async (req: Request, res: Response) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
        const {search, dontincrement, type, priceMin, priceMax, sizeMin, sizeMax} = req.query
        let page = req.query.page ? +req.query.page : 1;
        const offset = limit ? (page-1) * limit : 0 

        let offices;

        // Build search query
        let s: any = {hidden: false, $or:[]}
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
        // TODO : Add check for page


        // Check views should be incremented or not
        if(dontincrement === "true")
            offices = limit ? await Office.find(searchQuery).skip(offset).limit(limit) : await Office.find(searchQuery).skip(offset)
        else
            offices = limit ? await incrementAndFetchOffices(searchQuery, offset, limit) : await incrementAndFetchOffices(searchQuery, offset)
        return res.status(200).json({ status: "OK", offices}) // 200 OK
    } catch(e) {
        handleMongooseError(e as MongooseError, res);
    }
}

// GET /api/office/count
// GET /api/office/count?search=sss
// GET /api/office/count?type=sss
// GET /api/office/count?priceMin=iii
// GET /api/office/count?priceMax=iii
// GET /api/office/count?sizeMin=iii
// GET /api/office/count?sizeMax=iii
export const getOfficesCount = async (req: Request, res: Response) => {
    try {
        const {search, type, priceMin, priceMax, sizeMin, sizeMax} = req.query

        // Build search query
        let s: any = {hidden: false, $or:[]}
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

        const count = await Office.countDocuments(searchQuery)

        return res.status(200).json({status: "OK", count})
    } catch(e) {
        handleMongooseError(e as MongooseError, res)
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
    const { name, description, location, price, size, type, lng, lat } = req.body
    let {tags} = req.body
    tags = JSON.parse(tags)
    const position = {lng: +lng, lat: +lat}

    let baseUrl = `https://halmstadlokaler.s3.eu-north-1.amazonaws.com/`;
    let imageUrls;
    let documentUrls;

    const files = req.files as {[fieldname: string]: Express.Multer.File[]}

    if (!files || !files['images[]'] || !Array.isArray(files['images[]']) || files['images[]'].length === 0) {
        return res.status(400).json({status: "Bad Request", message: "Missing image files"})
    }

    const imageFiles = files["images[]"];
    const documentFiles = files["files[]"] || [];

    if (!name || !description || !location || !position || !position.lng || !position.lat || !size || !type || price == null) {
        return res.status(400).json({status: "Bad Request", message: "Missing required fields"})
    }

    try {
        imageUrls = await Promise.all(imageFiles.map(async (file) => {
            return await uploadImage(file, baseUrl)
        }))
        documentUrls = await Promise.all(documentFiles.map(async (file) => {
            return await uploadDocument(file, baseUrl)
        })) 
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
            images: imageUrls.map(urls => urls.imageUrl),
            documents: documentUrls.map(urls => urls.documentUrl),
            thumbnails: imageUrls.map(urls => urls.thumbnailUrl),
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
        const { name, description, price, size, type, existingImages, existingDocuments, existingThumbnails } = req.body
        let {tags} = req.body
        tags = JSON.parse(tags)
        
        const updateFields: Partial<{ name: string; description: string; price: number; size: number; type: string; tags: string[]; images: string[]; thumbnails: string[]; documents: string[] }> = {};

        if (name        !== undefined) updateFields.name = name;
        if (description !== undefined) updateFields.description = description;
        if (price       !== undefined) updateFields.price = price;
        if (size        !== undefined) updateFields.size = size;
        if (type        !== undefined) updateFields.type = type;
        if (tags        !== undefined) updateFields.tags = tags;
        
        // Handle existing images and documents
        if (existingImages) updateFields.images = existingImages;
        if (existingDocuments) updateFields.documents = existingDocuments;
        if (existingThumbnails) updateFields.thumbnails = existingThumbnails;
        
        const files = req.files as {[fieldname: string]: Express.Multer.File[]}
        
        // Handle new file uploads
        if (files && files['images[]'] && Array.isArray(files['images[]']) && files['images[]'].length > 0) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const imageFiles = files['images[]'];

            const imageUrls = await Promise.all(imageFiles.map(async (file) => {
                if (!file.mimetype.startsWith('image/')) {
                    throw new Error('Invalid file type');
                }

                const imageBuffer = await sharp(file.buffer)
                    .resize({ width: 800, height: 600 })
                    .toBuffer();

                const thumbnailBuffer = await sharp(file.buffer)
                    .resize(200)
                    .toBuffer();

                const bucketName = process.env.S3_BUCKET_NAME!;
                const key = `${Date.now()}-${file.originalname}`;
                const thumbnailKey = `thumbnail-${Date.now()}-${file.originalname}`;

                await uploadImageToS3(bucketName, key, imageBuffer);
                await uploadImageToS3(bucketName, thumbnailKey, thumbnailBuffer);

                return {
                    imageUrl: `https://halmstadlokaler.s3.eu-north-1.amazonaws.com/${key}`,
                    thumbnailUrl: `https://halmstadlokaler.s3.eu-north-1.amazonaws.com/${thumbnailKey}`
                };
            }));

            updateFields.images = [...(updateFields.images || []), ...imageUrls.map(urls => urls.imageUrl)];
            updateFields.thumbnails = [...(updateFields.thumbnails || []), ...imageUrls.map(urls => urls.thumbnailUrl)]
        }

        if (files && files['files[]'] && Array.isArray(files['files[]']) && files['files[]'].length > 0) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };
            const documentFiles = files['files[]'];

            const documentUrls = await Promise.all(documentFiles.map(async (file) => {
                if (!file.mimetype.startsWith('application/')) {
                    throw new Error('Invalid file type');
                }

                const bucketName = process.env.S3_BUCKET_NAME!;
                const key = `${Date.now()}-${file.originalname}`;

                await uploadImageToS3(bucketName, key, file.buffer);

                return `https://halmstadlokaler.s3.eu-north-1.amazonaws.com/${key}`;
            }));

            updateFields.documents = [...(updateFields.documents || []), ...documentUrls];
        }
        // Find and update the office document with the constructed updateFields
        const updatedOffice = await Office.findOneAndUpdate(
            {_id: id, owner: (req.user as IUser)._id},
            updateFields,
            {new: true, runValidators: true}
        )

        if(!updatedOffice) return res.status(404).json({status: "Not Found", message: "Don't own office with id"})

        return res.status(200).json({status: "OK",office: updatedOffice})
    } catch(e) {
        console.error(e)
       handleMongooseError(e as MongooseError, res) 
    }
}

export const putOfficeHidden = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const office = await Office.findOne({_id: id, owner: (req.user as IUser)._id})
        if(!office) return res.status(404).json({status: "Not Found", message: "No ownership of office with id"})
        office.hidden = !office.hidden
        await office.save()
        return res.status(200).json({status: "OK", office})
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