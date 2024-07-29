
// utils/config.js
require('dotenv').config();

const MONGODB_URL = process.env.MONGODB_URI;

module.exports = {
    MONGODB_URL
}
