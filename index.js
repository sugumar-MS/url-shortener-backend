
// index.js

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import shortid from 'shortid';
import cookieParser from 'cookie-parser';
import { UserRouter } from './routes/user.js'; // Ensure this matches the actual file name

dotenv.config();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:5173'];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
app.use('/auth', UserRouter);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, default: shortid.generate },
});

const Url = mongoose.model('Url', urlSchema);

app.post('/shorten', async (req, res) => {
    try {
        const { originalUrl } = req.body;
        const shortUrl = shortid.generate();

        const newUrl = new Url({ originalUrl, shortUrl });
        await newUrl.save();

        res.json(newUrl);
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error
            res.status(400).json({ message: 'Duplicate short URL' });
        } else {
            console.error('Error creating short URL:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
});

app.get('/:shortUrl', async (req, res) => {
    try {
        const { shortUrl } = req.params;
        const url = await Url.findOne({ shortUrl });

        if (url) {
            return res.redirect(url.originalUrl);
        } else {
            return res.status(404).json('URL not found');
        }
    } catch (error) {
        console.error('Error retrieving short URL:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} successfully`);
});
