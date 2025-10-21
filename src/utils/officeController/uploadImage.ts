import sharp from "sharp";
import { uploadImageToS3 } from "../s3client";

export default async function uploadImage(file: Express.Multer.File, baseUrl: string) {
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('Invalid file type');
    }
    const bucketName = process.env.S3_BUCKET_NAME!;

    // Normalize orientation according to EXIF and re-encode to remove orientation metadata
    const normalizedBuffer = await sharp(file.buffer)
        .rotate() // correct orientation based on EXIF
        .toBuffer();

    // Create a thumbnail from the normalized image
    const thumbnail = await sharp(normalizedBuffer)
        .resize(200, 200, { fit: 'cover' })
        .toBuffer();

    const key = `${Date.now()}-${file.originalname}`;
    const thumbnailKey = `thumbnail-${Date.now()}-${file.originalname}`;
    
    // Upload the normalized full-size image and the thumbnail
    await uploadImageToS3(bucketName, key, normalizedBuffer);
    await uploadImageToS3(bucketName, thumbnailKey, thumbnail);   

    return {
        imageUrl: `${key}`,
        thumbnailUrl: `${thumbnailKey}`
    }
}