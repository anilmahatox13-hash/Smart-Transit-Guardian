const { Bus } = require('../models');
const Ticket = require('../models/Ticket');
const { sendMultiChannelAlert } = require('./alertService');
const { getIO } = require('../config/socket');

/**
 * Autonomous Background Perception-Action Loop
 * Periodically monitors active bus speeds & detects gridlocks
 */
function startAutonomousFleetSupervisor() {
  console.log('🤖 [AGENT SUPERVISOR] Autonomous Highway Fleet Supervisor Loop initialized (30s interval)');

  setInterval(async () => {
    try {
      const activeBuses = await Bus.find({ isLive: true });

      for (const bus of activeBuses) {
        // Condition: Bus is in transit but speed drops to 0 km/h (Anomaly Detection)
        if (bus.currentSpeed === 0 && bus.currentChowkIndex > 1) {
          console.log(`⚠️ [AGENT PERCEPTION] Telemetry Anomaly Detected: Bus ${bus.busNumber} halted between highway stages.`);

          const affectedTickets = await Ticket.find({
            busId: bus._id,
            travelDate: new Date().toISOString().split('T')[0],
            status: 'confirmed'
          });

          if (affectedTickets.length > 0) {
            console.log(`🤖 [AGENT ACTION] Autonomously dispatching proactive WhatsApp delay warnings to ${affectedTickets.length} commuters.`);
            
            for (const ticket of affectedTickets) {
              await sendMultiChannelAlert({
                toPhone: ticket.passengerPhone,
                passengerName: ticket.passengerName,
                message: `Proactive Agent Advisory: Your bus (${bus.busName}) is currently experiencing heavy congestion near stop #${bus.currentChowkIndex}. Our autonomous agent has adjusted the stage ETA by +15 mins.`,
                type: 'DELAY'
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Autonomous Supervisor Error:', err.message);
    }
  }, 30000); // Evaluates every 30 seconds
}

module.exports = { startAutonomousFleetSupervisor };