import { uploadDocumentToS3 } from "../s3client";

export default async function uploadDocument(file: Express.Multer.File, baseUrl: string): Promise<{documentUrl: string}> {
    if (!file.mimetype.startsWith('application/pdf')) {
        throw new Error('Invalid file type');
    }
    const bucketName = process.env.S3_BUCKET_NAME!;
    const key = `${Date.now()}-${file.originalname}`;

    await uploadDocumentToS3(bucketName, key, file.buffer);
    return {
        documentUrl: `${baseUrl}${key}`
    }
}