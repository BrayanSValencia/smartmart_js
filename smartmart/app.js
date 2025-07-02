import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import createError from 'http-errors';
import cors from 'cors';

// Import route files
import authRoutes from './routes/authroutes.js';
import categoryRoutes from './routes/categoryroutes.js';
import productRoutes from './routes/productroutes.js';
import checkoutRoutes from './routes/orderroutes.js';
import userRoutes from './routes/userroutes.js';
import dotenv from 'dotenv'


const app = express();
dotenv.config()

// Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS configuration 
const corsOptions = {
  origin: process.env.ORIGINS.split(","),
  methods: process.env.METHODS.split(","), 
  allowedHeaders: process.env.ALLOWEDHEADERS.split(","),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/users', userRoutes);



// 404 handler
app.use('/api', (req, res, next) => {
  next(createError(404, 'API endpoint not found'));
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const response = {
    error: true,
    message: err.message || 'Internal Server Error',
    ...(req.app.get('env') === 'development' && { stack: err.stack })
  };
  res.status(status).json(response);
});

export default app;