const express = require('express');
const router = express.Router();
const { processAgentQuery, simulateIncident, getAgentTools } = require('../controllers/agentController');

router.post('/query', processAgentQuery);
router.post('/simulate-incident', simulateIncident);
router.get('/tools', getAgentTools);

module.exports = router;
