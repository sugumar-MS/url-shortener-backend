// models/Url.js
import mongoose from "mongoose";
import shortid from "shortid"; // Import shortid here

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, default: shortid.generate },
});

const UrlModel = mongoose.model('Url', urlSchema);

export { UrlModel as Url };
