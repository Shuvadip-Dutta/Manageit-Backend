const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
    },
    admin:{
        type: mongoose.Schema.Types.ObjectId, 
        ref:'User', 
        required: true
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

});

module.exports = mongoose.model('Organization', organizationSchema);