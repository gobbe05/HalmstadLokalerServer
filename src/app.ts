import express, { Application, Response, Request } from 'express';
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
import isAuthenticated from './middleware/isAuthenticated';
import statisticRoutes from './routes/statisticRoutes';
import savedOfficeRoutes from './routes/savedOfficeRoutes';
import bodyParser from 'body-parser';
import articleRoutes from './routes/articleRoutes';
import sellerRoutes from './routes/sellerRoutes';

const app: Application = express();

// Middleware
app.use(cors({
    origin: ORIGIN,
    credentials: true}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));



// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../../../HalmstadLokalerClient/dist')));

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
app.use('/api/statistics', isAuthenticated, statisticRoutes)
app.use('/api/message', messageRoutes)
app.use('/api/conversation', conversationRoutes)
app.use('/api/office', officeRoutes)
app.use('/api/savedsearch', savedSearchRoutes)
app.use('/api/pin', pinRoutes)
app.use('/api/seller', isAuthenticated, sellerRoutes)
app.use('/api/saved', savedOfficeRoutes)
app.use('/auth', authRoutes)
app.use('/api/article', articleRoutes)

// Catch-all handler for any requests that don’t match the static files
app.get('*', (req: Request, res: Response) => {
    console.log('Request URL:', req.url);
    return res.sendFile(path.join(__dirname, '../../../HalmstadLokalerClient/dist', 'index.html'));
});

export default app;