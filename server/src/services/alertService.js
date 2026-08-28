const twilio = require('twilio');

// Optional Twilio credentials (if configured in server/.env)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const fromWhatsApp = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let client = null;
if (accountSid && authToken && accountSid.startsWith('AC')) {
  client = twilio(accountSid, authToken);
}

/**
 * Dispatches a real-time notification via SMS & WhatsApp
 * @param {Object} payload { toPhone, passengerName, message, type: 'BOOKING'|'DELAY'|'EMERGENCY' }
 */
async function sendMultiChannelAlert({ toPhone, passengerName, message, ticketDetails = null, type = 'BOOKING' }) {
  const timestamp = new Date().toLocaleTimeString();
  const sanitizedPhone = String(toPhone).replace(/\s+/g, '');
  
  // Format international number (+977 or +91 fallback)
  let formattedPhone = sanitizedPhone;
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.length === 10 && formattedPhone.startsWith('98') 
      ? `+977${formattedPhone}` 
      : `+91${formattedPhone}`;
  }

  const alertHeader = type === 'EMERGENCY' 
    ? '🚨 [SMART TRANSIT GUARDIAN: CRITICAL ALERT]' 
    : type === 'DELAY' 
      ? '⚠️ [SMART TRANSIT: HIGHWAY TELEMETRY ADVISORY]' 
      : '🎫 [SMART TRANSIT: VERIFIED E-TICKET PASS]';

  const fullMessage = `${alertHeader}\nHello ${passengerName || 'Passenger'},\n\n${message}\n\n` +
    (ticketDetails ? `🚌 Bus: ${ticketDetails.busName} (${ticketDetails.busNumber})\n💺 Seat(s): ${ticketDetails.seats}\n📍 Route: ${ticketDetails.route}\n🔑 Ticket Code: ${ticketDetails.ticketNumber}\n` : '') +
    `⏰ System Timestamp: ${timestamp}\nVerify: http://localhost:5173/verify-ticket`;

  console.log('\n=============================================================');
  console.log(`📡 [AGENT DISPATCHER] Actuating ${type} Multi-Channel Broadcast`);
  console.log(`📲 Target Number: ${formattedPhone}`);
  console.log(`💬 WhatsApp Payload:\n${fullMessage}`);
  console.log('=============================================================\n');

  const deliveryReport = {
    sms: { sent: false, provider: 'Simulated Gateway / Ready for Twilio', target: formattedPhone },
    whatsapp: { sent: false, provider: 'Simulated Gateway / Ready for Twilio', target: `whatsapp:${formattedPhone}` }
  };

  // If live Twilio keys exist, send live SMS & WhatsApp messages
  if (client && fromPhone) {
    try {
      const smsRes = await client.messages.create({
        body: fullMessage,
        from: fromPhone,
        to: formattedPhone
      });
      deliveryReport.sms = { sent: true, sid: smsRes.sid, provider: 'Twilio Live SMS' };
    } catch (err) {
      deliveryReport.sms.error = err.message;
    }

    try {
      const waRes = await client.messages.create({
        body: fullMessage,
        from: fromWhatsApp,
        to: `whatsapp:${formattedPhone}`
      });
      deliveryReport.whatsapp = { sent: true, sid: waRes.sid, provider: 'Twilio Live WhatsApp' };
    } catch (err) {
      deliveryReport.whatsapp.error = err.message;
    }
  } else {
    // Development fallback
    deliveryReport.sms.sent = true;
    deliveryReport.whatsapp.sent = true;
  }

  return {
    success: true,
    dispatchedAt: new Date().toISOString(),
    payloadPreview: fullMessage,
    deliveryReport
  };
}

module.exports = { sendMultiChannelAlert };