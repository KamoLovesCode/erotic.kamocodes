import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mediaRoutes from './routes/mediaRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// CORS configuration: allow explicit origins via env, or use common dev origins
const getOrigins = () => {
    if (process.env.CORS_ORIGIN) {
        return process.env.CORS_ORIGIN
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean);
    }

    // Default development origins
    return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
    ];
};

const allowedOrigins = getOrigins();

console.log('CORS Allowed Origins:', allowedOrigins); // Debug log

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error(`CORS blocked for origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const uploadsPath = path.resolve('server/uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/media', mediaRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const host = process.env.HOST || '0.0.0.0';

const start = async () => {
    await connectDB();
    app.listen(port, host, () => {
        console.log(`Server running on http://${host}:${port}`);
        console.log(`CORS configured for origins: ${allowedOrigins.join(', ')}`);
    });
};

start();