const express = require('express');
const router = express.Router();
const { bookTicket, getMyTickets, verifyTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');

router.post('/book', protect, bookTicket);
router.get('/my-tickets', protect, getMyTickets);
router.get('/verify/:identifier', verifyTicket);

module.exports = router;