import express, { Application } from 'express';
import cors from 'cors';
import officeRoutes from './routes/officeRoutes';
import { ORIGIN, SESSION_SECRET } from './config';
import session from 'express-session';
import passport from './auth';
import authRoutes from './routes/authRoutes';
import pinRoutes from './routes/pinRoutes';
import path from 'path';
import savedSearchRoutes from './routes/savedSearchRoutes';
import messageRoutes from './routes/messageRoutes';
import conversationRoutes from './routes/conversationRoutes';

const app: Application = express();

// Middleware
app.use(cors({
    origin: ORIGIN,
    credentials: true}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    })
)

// Initialize passport and sessions
app.use(passport.initialize())
app.use(passport.session())


// Routes
app.use('/api/message', messageRoutes)
app.use('/api/conversation', conversationRoutes)
app.use('/api/office', officeRoutes)
app.use('/api/savedsearch', savedSearchRoutes)
app.use('/api/pin', pinRoutes)
app.use('/auth', authRoutes)

export default app;