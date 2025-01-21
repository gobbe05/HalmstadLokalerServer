import sharp from "sharp";
import { uploadImageToS3 } from "../s3client";

export default async function uploadImage(file: Express.Multer.File, baseUrl: string) {
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type');
    }
    const bucketName = process.env.S3_BUCKET_NAME!;
    const thumbnail = await sharp(file.buffer).resize(200).toBuffer()
    const key = `${Date.now()}-${file.originalname}`;
    const thumbnailKey = `thumbnail-${Date.now()}-${file.originalname}`;
    
    await uploadImageToS3(bucketName, key, file.buffer);
    await uploadImageToS3(bucketName, thumbnailKey, thumbnail);   

    return {
        imageUrl: `${baseUrl}${key}`,
        thumbnailUrl: `${baseUrl}${thumbnailKey}`
    }
}