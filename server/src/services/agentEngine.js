const crypto = require('crypto');
const { Bus } = require('../models');
const Ticket = require('../models/Ticket');
const { sendMultiChannelAlert } = require('./alertService');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });
const GROQ_MODEL_CANDIDATES = [
  'qwen/qwen3.8-27b',
  'llama-4-scout-17b-16e-instruct',
  'qwen/qwen3-32b',
  'openai/gpt-oss-20b'
];
let resolvedGroqModelPromise;

async function resolveGroqModel() {
  if (!resolvedGroqModelPromise) {
    resolvedGroqModelPromise = groq.models.list().then((response) => {
      const availableModels = new Set((response.data || []).map(model => model.id));
      const configuredModel = process.env.GROQ_MODEL?.trim();
      const selectedModel = [configuredModel, ...GROQ_MODEL_CANDIDATES]
        .find(model => model && availableModels.has(model));

      if (!selectedModel) {
        throw new Error('No supported Groq model is available for this API key. Set GROQ_MODEL to a model returned by Groq.');
      }

      return selectedModel;
    });
  }

  return resolvedGroqModelPromise;
}

const TOOLS = [
  {
    name: 'search_buses',
    description: 'Search for active buses by origin and destination.'
  },
  {
    name: 'book_ticket',
    description: 'Reserve one seat after the passenger explicitly provides a destination.'
  },
  {
    name: 'simulate_incident',
    description: 'Record a highway incident and notify passengers on the affected bus.'
  }
];

async function searchBusesTool({ origin = '', destination = '' }) {
  let query = {};
  if (origin) query.$or = [{ originDistrict: { $regex: origin, $options: 'i' } }, { originChowk: { $regex: origin, $options: 'i' } }];
  if (destination) query.destDistrict = { $regex: destination, $options: 'i' };
  const buses = await Bus.find(query).limit(5);
  return { tool: 'search_buses', count: buses.length, results: buses.map(b => ({ id: b._id, name: b.busName, number: b.busNumber, corridor: `${b.originDistrict} ➔ ${b.destDistrict}`, fare: `NPR ${b.baseFare}` })) };
}

async function bookTicketTool({ destination, passengerName, passengerPhone, selectedSeat = 'A1', userId = null }) {
  let targetBus = destination ? await Bus.findOne({ destDistrict: { $regex: new RegExp(destination, 'i') } }) : await Bus.findOne({ isLive: true });
  if (!targetBus) throw new Error(`I couldn't find any operational buses heading to ${destination || 'that destination'} right now.`);

  const computedFare = targetBus.baseFare || 500;
  const ticketNumber = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
  const secret = process.env.JWT_SECRET || 'smarttransit_secure';
  const verificationHash = crypto.createHmac('sha256', secret).update(ticketNumber).digest('hex');

  const ticket = await Ticket.create({
    ticketNumber, busId: targetBus._id, passengerId: userId || targetBus.operatorId,
    passengerName: passengerName || 'Guest Commuter', passengerPhone: passengerPhone || '+977 9800000000',
    selectedSeats: [selectedSeat || 'A1'], originChowk: targetBus.originChowk || targetBus.originDistrict || 'Station', destinationChowk: targetBus.destinationChowk || targetBus.destDistrict || 'Station',
    travelDate: new Date().toISOString().split('T')[0], totalFare: computedFare, currency: 'NPR', paymentMethod: 'cash_on_boarding', paymentStatus: 'pending_cash', verificationHash, status: 'confirmed'
  });

  const alertResult = await sendMultiChannelAlert({
    toPhone: ticket.passengerPhone, passengerName: ticket.passengerName, message: `Reservation confirmed by Smart Transit AI.`,
    ticketDetails: { busName: targetBus.busName, busNumber: targetBus.busNumber, seats: selectedSeat, route: `${ticket.originChowk} ➔ ${ticket.destinationChowk}`, ticketNumber: ticket.ticketNumber }, type: 'BOOKING'
  });

  return { tool: 'book_ticket', ticketNumber: ticket.ticketNumber, busName: targetBus.busName, seatsReserved: [selectedSeat], totalFare: `NPR ${computedFare}`, alertDispatch: alertResult };
}

async function triggerHighwayIncidentTool({ busId, reason = 'Highway incident reported', delayMinutes = 15 }) {
  const targetBus = await Bus.findById(busId);
  if (!targetBus) throw new Error('Target bus not found.');

  const affectedTickets = await Ticket.find({
    busId: targetBus._id,
    travelDate: new Date().toISOString().split('T')[0],
    status: 'confirmed'
  });

  for (const ticket of affectedTickets) {
    await sendMultiChannelAlert({
      toPhone: ticket.passengerPhone,
      passengerName: ticket.passengerName,
      message: `Incident advisory: ${reason}. Estimated delay: ${delayMinutes} minutes.`,
      type: 'DELAY'
    });
  }

  return { busId: targetBus._id, affectedTickets: affectedTickets.length, reason, delayMinutes };
}

async function executeAgentReasoningLoop(userPrompt, context = {}) {
  const reasoningSteps = [];
  reasoningSteps.push({ step: 1, phase: 'PERCEPTION', thought: `Received user prompt: "${userPrompt}"` });

  if (!process.env.GROQ_API_KEY || !process.env.GROQ_API_KEY.startsWith('gsk_')) {
    reasoningSteps.push({ step: 4, phase: 'ERROR', thought: `Invalid Groq API Key detected.` });
    return { userPrompt, reasoningSteps, toolExecuted: 'none', toolOutput: null, agentResponse: `⚠️ Authentication Error: Your Groq API key is missing or invalid. It should start with 'gsk_'.`, timestamp: new Date().toISOString() };
  }

  try {
    const groqModel = await resolveGroqModel();
    reasoningSteps.push({ step: 2, phase: 'REASONING', thought: `Routing to Groq model ${groqModel} for intent evaluation.` });

    const tools = [
      {
        type: "function",
        function: {
          name: "search_buses",
          description: "Search for active buses by origin and destination.",
          parameters: { type: "object", properties: { origin: { type: "string" }, destination: { type: "string" } } }
        }
      },
      {
        type: "function",
        function: {
          name: "book_ticket",
          description: "Autonomously reserve a seat. ONLY call this if the user has explicitly stated their destination.",
          parameters: { type: "object", properties: { destination: { type: "string", description: "The destination city (e.g. Kathmandu, Pokhara)." }, seat: { type: "string", description: "Seat number (e.g., A1)." } }, required: ["destination"] }
        }
      }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: "system", 
          content: `You are the highly advanced, conversational 'Autonomous Transit Agent' for Smart Transit Guardian. 
          CORE RULES:
          1. If the user greets you, greet them back warmly and ask how you can help them with their transit today. DO NOT invoke tools for simple greetings.
          2. If the user wants to book a ticket but does not specify a destination, DO NOT invoke a tool. Instead, ask: "I'd love to help you book a ticket! Where are you traveling to?"
          3. If the user gives a clear destination, you MUST use the 'book_ticket' tool.
          4. Keep responses concise and format bus names in bold.`
        },
        { role: "user", content: userPrompt }
      ],
      model: groqModel,
      temperature: 0.2,
      tools: tools,
      tool_choice: "auto",
    });

    const responseMessage = chatCompletion.choices[0].message;
    const toolCalls = responseMessage.tool_calls;

    let toolResult = null;
    let toolNameExecuted = 'none';
    let finalAnswer = '';

    if (toolCalls && toolCalls.length > 0) {
      const call = toolCalls[0];
      toolNameExecuted = call.function.name;
      const args = JSON.parse(call.function.arguments);

      reasoningSteps.push({ step: 3, phase: 'ACTION', thought: `Groq actuated tool: [${toolNameExecuted}] with parameters: ${JSON.stringify(args)}` });

      if (toolNameExecuted === "search_buses") {
        toolResult = await searchBusesTool({ origin: args.origin, destination: args.destination });
        finalAnswer = `I found **${toolResult.count} active buses**. Top option: **${toolResult.results[0]?.name || 'Transit Fleet'}** (${toolResult.results[0]?.fare || 'NPR 500'}). Would you like me to reserve a seat for you?`;
      } else if (toolNameExecuted === "book_ticket") {
        toolResult = await bookTicketTool({ destination: args.destination, passengerName: context.name, passengerPhone: context.phone, selectedSeat: args.seat, userId: context.userId });
        finalAnswer = `Done! I have autonomously booked Seat ${toolResult.seatsReserved[0]} on **${toolResult.busName}** heading to ${args.destination}. Your digital ticket number is **${toolResult.ticketNumber}**, and I've already sent a verification pass to your WhatsApp. Have a safe trip!`;
      }
    } else {
      reasoningSteps.push({ step: 3, phase: 'CONVERSATION', thought: `Groq processed text naturally without physical actuation.` });
      finalAnswer = responseMessage.content;
    }

    return { userPrompt, reasoningSteps, toolExecuted: toolNameExecuted, toolOutput: toolResult, agentResponse: finalAnswer, timestamp: new Date().toISOString() };
  
  } catch (error) {
    reasoningSteps.push({ step: 4, phase: 'ERROR', thought: `Execution failed: ${error.message}` });
    return { userPrompt, reasoningSteps, toolExecuted: 'none', toolOutput: null, agentResponse: `⚠️ System Error: ${error.message}`, timestamp: new Date().toISOString() };
  }
}

module.exports = { executeAgentReasoningLoop, TOOLS, triggerHighwayIncidentTool };
