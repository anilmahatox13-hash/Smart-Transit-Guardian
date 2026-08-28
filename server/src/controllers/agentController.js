const { executeAgentReasoningLoop, TOOLS, triggerHighwayIncidentTool } = require('../services/agentEngine');

// @desc    Process Natural Language Query with Agentic Tool Calling
// @route   POST /api/agent/query
const processAgentQuery = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ success: false, message: 'Agent prompt cannot be empty.' });
    }

    const context = {
      userId: req.user?.id || req.user?._id,
      name: req.user?.name,
      phone: req.user?.phone
    };

    const agentResult = await executeAgentReasoningLoop(prompt, context);
    res.status(200).json({ success: true, ...agentResult });
  } catch (error) {
    console.error('Agent Query Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate Highway Emergency & Broadcast WhatsApp Alerts
// @route   POST /api/agent/simulate-incident
const simulateIncident = async (req, res) => {
  try {
    const { busId, reason, delayMinutes } = req.body;
    const result = await triggerHighwayIncidentTool({ busId, reason, delayMinutes });
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Agent Capability Manifest
// @route   GET /api/agent/tools
const getAgentTools = (req, res) => {
  res.status(200).json({ success: true, tools: TOOLS });
};

module.exports = {
  processAgentQuery,
  simulateIncident,
  getAgentTools
};
