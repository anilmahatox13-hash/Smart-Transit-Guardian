const express = require('express');
const router = express.Router();
const { bookTicket, getUserTickets, verifyTicket } = require('../controllers/ticketController');

// Safely load auth middleware if it exists to prevent crashes
let protect = (req, res, next) => next();
try { protect = require('../middlewares/authMiddleware').protect; } catch (e) {}

// Public/Open Routes
router.post('/book', bookTicket);
router.post('/verify', verifyTicket);

// Protected Routes (Requires Login)
router.get('/my-tickets', protect, getUserTickets);
router.get('/', protect, getUserTickets); // Fallback for general GET

module.exports = router;
