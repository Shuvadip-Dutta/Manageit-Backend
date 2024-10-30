const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
    },
});

const CardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    items: [ItemSchema], 
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board', 
        required: true,
    },
    position: { type: Number, required: true }
});

const Card = mongoose.model('Card', CardSchema);
module.exports = Card;
