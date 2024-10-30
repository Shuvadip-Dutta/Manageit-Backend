const express = require('express');
const router = express.Router();
const Board = require('../models/boardModel');
const Card = require('../models/cardModel');
const Organization = require('../models/organizationModel');
const { authenticateToken } = require('../middleware/authenticateToken');
const checkMembership = require('../middleware/checkMembership');

// Create Board
router.post('/organizations/:orgId/boards', authenticateToken, checkMembership, async (req, res) => {
    const { title } = req.body;
    const { orgId } = req.params;

    const newBoard = new Board({
        title,
        organizationId: orgId,
        cards: [], // Start with an empty cards array
    });

    try {
        const savedBoard = await newBoard.save();
        res.status(201).json(savedBoard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create board' });
    }
});

// Get all boards
router.get('/organizations/:orgId/boards', authenticateToken, checkMembership, async (req, res) => {
    const { orgId } = req.params;

    try {
        const boards = await Board.find({ organizationId: orgId }).populate('cards');
        res.json(boards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch boards' });
    }
});

// Delete Board
router.delete('/organizations/:orgId/boards/:boardId', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId } = req.params;

    try {
        // Check if the organization exists and if the user is the admin
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        if (organization.admin.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Only the admin can delete boards' });
        }

        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }

        await board.deleteOne();
        res.status(200).json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete board' });
    }
});


// Create Card
router.post('/organizations/:orgId/boards/:boardId/cards', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId } = req.params;
    const { title, position } = req.body;


    try {
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }

        const newCard = new Card({
            title,
            boardId,
            items: [],
            position // Start with an empty items array
        });

        const savedCard = await newCard.save();
        // Add the card ID to the corresponding board
        await Board.findByIdAndUpdate(boardId, { $push: { cards: savedCard._id } });

        res.status(201).json(savedCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create card' });
    }
});


router.get('/organizations/:orgId/boards/:boardId/cards', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId } = req.params;

    try {
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }
        const cards = await Card.find({ boardId }).sort({ position: 1 });
        res.json(cards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch cards' });
    }
});

// Update card position
router.put('/organizations/:orgId/boards/:boardId/cards/:cardId/position', authenticateToken, async (req, res) => {
    const { orgId, boardId, cardId } = req.params;
    const { newPosition } = req.body;

    try {
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        card.position = newPosition; // Update the position
        await card.save();

        res.status(200).json({ message: 'Card position updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update card position' });
    }
});


// Delete Card
router.delete('/organizations/:orgId/boards/:boardId/cards/:cardId', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId, cardId } = req.params;

    try {
        // Check if the organization exists and if the user is the admin
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }

        const card = await Card.findOneAndDelete({ _id: cardId, boardId });
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        // Remove the card ID from the corresponding board
        await Board.findByIdAndUpdate(boardId, { $pull: { cards: cardId } });
        res.status(200).json({ message: 'Card deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete card' });
    }
});

// Create an item in a card
router.post('/organizations/:orgId/boards/:boardId/cards/:cardId/items', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId, cardId } = req.params; // Extracting cardId from params
    const { title, assignedTo } = req.body;

    try {
        // Check if the organization exists and if the user is the admin
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        const newItem = { title, assignedTo };
        card.items.push(newItem);
        await card.save();

        res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create item' });
    }
});

router.get('/organizations/:orgId/boards/:boardId/cards/:cardId/items', authenticateToken, checkMembership, async (req, res) => {
    const { orgId, boardId, cardId } = req.params;

    try {
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }
        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }
        res.json(card.items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Delete an item from a card
router.delete('/organizations/:orgId/boards/:boardId/cards/:cardId/items/:itemId', authenticateToken,checkMembership, async (req, res) => {
    const { orgId, boardId, cardId, itemId } = req.params; // Extracting cardId and itemId from params

    try {
        // Check if the organization exists and if the user is the admin
        const organization = await Organization.findById(orgId);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Check if the board exists within the organization
        const board = await Board.findOne({ _id: boardId, organizationId: orgId });
        if (!board) {
            return res.status(404).json({ error: 'Board not found in this organization' });
        }

        const card = await Card.findById(cardId);
        if (!card) {
            return res.status(404).json({ error: 'Card not found' });
        }

        card.items = card.items.filter(item => item._id.toString() !== itemId);
        await card.save();

        res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});


module.exports = router;
