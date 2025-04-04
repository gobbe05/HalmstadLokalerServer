import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import dotenv from 'dotenv'
dotenv.config();


const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});
export const uploadImageToS3 = async (bucketName: string, key: string, fileBuffer: Buffer) => {
    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: 'image/jpeg', // Adjust based on your file type
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        const response = await s3.send(command);
    } catch (err) {
        console.error('Upload Error', err);
    }
};
export const uploadDocumentToS3 = async (bucketName: string, key: string, fileBuffer: Buffer) => {
    const uploadParams = {
        Bucket: bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf', // Adjust based on your file type
    };

    try {
        const command = new PutObjectCommand(uploadParams);
        const response = await s3.send(command);
    } catch (err) {
        console.error('Upload Error', err);
    }
}