import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGO_URI = process.env.MONGO_URI || '';
export const ORIGIN = process.env.ORIGIN || '';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
export const SALT_ROUNDS = 10;

export const TEST_USER_ID = "672cbfcc740259a4f0b10ceb"