
const mongoose = require('mongoose');

const verifiedEmailSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900 // 15 mins expiration time
    }
});

module.exports = mongoose.model('VerifiedEmail', verifiedEmailSchema);
