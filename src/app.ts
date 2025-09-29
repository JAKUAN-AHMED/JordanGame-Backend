import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import path from 'path';
import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFount';
import router from './routes';
import { Morgan } from './shared/morgen';
import i18next from './i18n/i18n'; // Import the i18next configuration
import i18nextMiddleware from 'i18next-express-middleware';
import passport from './config/passport';
// import session from "express-session";

const app = express();

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

export const corsOptions = {
  origin: ['http://localhost:5173','http://10.10.7.68:3007','http://localhost:3007','https://iter-bene.s3.eu-north-1.amazonaws.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

// export const corsOptions = {
//   origin: ['*'], 
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, 
// };

//middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use cookie-parser to parse cookies
app.use(cookieParser());

// file retrieve
app.use('/uploads', express.static(path.join(__dirname, '../uploads/')));

// Use i18next middleware
app.use(i18nextMiddleware.handle(i18next));

// router
app.use('/api/v1', router);

// Middleware`
// app.use(session({ secret: "secret-key", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
// app.use(passport.session());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
app.use('/demoUpload', express.static(path.join(process.cwd(), 'demoUpload')));

// live response
app.get('/test', (req: Request, res: Response) => {
  res.status(201).json({ message: 'Welcome' });
});

app.get('/test/:lang', (req: Request, res: Response) => {
  const { lang } = req.params;

  // Change the language dynamically for the current request
  i18next.changeLanguage(lang); // Switch language

  console.log(`Current language: ${i18next.language}`); // Log the current language

  // Send the translated response
  res.status(200).json({ message: 'Welcome' }); // Get translated 'welcome' message
});

// global error handle
app.use(globalErrorHandler);

// handle not found route
app.use(notFound);

export default app;
