// utils/errorHandler.ts
import { Response } from 'express';

interface MongooseError extends Error {
    name: string;
    errors?: { [key: string]: { message: string } };
    code?: number;
    keyValue?: { [key: string]: string };
    path?: string;
    value?: string;
}

export default function handleMongooseError(error: MongooseError, res: Response): void {
    // Validation Error
    if (error.name === 'ValidationError' && error.errors) {
        const messages = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
            message: "Validation error",
            errors: messages
        });
        return;
    }

    // Cast Error (usually invalid ObjectId)
    if (error.name === 'CastError' && error.path && error.value) {
        res.status(400).json({
            message: `Invalid ${error.path}: ${error.value}`
        });
        return;
    }

    // Duplicate Key Error (usually from unique constraints)
    if (error.code === 11000 && error.keyValue) {
        const field = Object.keys(error.keyValue);
        res.status(409).json({
            message: `Duplicate key error: ${field} already exists`
        });
        return;
    }

    // Handle other types of errors
    res.status(500).json({
        message: "An unexpected error occurred",
        error: error.message
    });
}