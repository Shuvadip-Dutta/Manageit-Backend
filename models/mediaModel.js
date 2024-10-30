const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    orgId:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required : true
    },
    url:{
        type: String,
        required: true
    },
    mediaType:{
        type : String,
        require: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    },
});

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;