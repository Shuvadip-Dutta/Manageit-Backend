const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes')
const organizationRoutes = require('./routes/organizationRoutes');
const boardRoutes = require('./routes/boardRoutes');
const firebaseConfig = require('./firebaseConfig');

const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use(userRoutes);
app.use(organizationRoutes);
app.use(boardRoutes);

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Listen for card drag-and-drop events
    socket.on('cardMoved', async ({ cardId, newPosition }) => {
        // Broadcast the updated card position to other clients
        socket.broadcast.emit('cardUpdated', { cardId, newPosition });

        // Optionally, you could also update the card's position in the database
        try {
            await Card.findByIdAndUpdate(cardId, { position: newPosition }); // Ensure you have a `position` field in your Card schema
        } catch (error) {
            console.error('Failed to update card position:', error);
        }
    });

    // Listen for drag-and-drop events
    socket.on('moveItem', async ({ itemId, sourceCardId, targetCardId }) => {
        try {
            // Update the item in the database
            const cardFrom = await Card.findById(sourceCardId);
            const cardTo = await Card.findById(targetCardId);

            // Remove item from the source card
            const item = cardFrom.items.id(itemId);
            cardFrom.items.id(itemId).remove();
            await cardFrom.save();

            // Add item to the target card
            cardTo.items.push(item);
            await cardTo.save();

            // Emit the event to all clients
            io.emit('itemMoved', { itemId, sourceCardId, targetCardId });
        } catch (error) {
            console.error('Error moving item:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

//Database connection
mongoose.connect('mongodb://localhost:27017/config');


//Port

app.listen(4000, () => {
    console.log('Server running on port 4000...');
});


