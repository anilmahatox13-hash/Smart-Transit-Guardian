const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ path: './server/.env' });
require('dotenv').config();

const dbConfig = require('./config/db');
const { initSocket } = require('./config/socket');
const { startAutonomousFleetSupervisor } = require('./services/autonomousIncidentAgent');

const authRoutes = require('./routes/authRoutes');
const busRoutes = require('./routes/busRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const agentRoutes = require('./routes/agentRoutes');

const app = express();
const server = http.createServer(app);

// Initialize WebSocket Telemetry
initSocket(server);

// Bulletproof DB Connection Handler
if (typeof dbConfig === 'function') {
  dbConfig();
} else if (typeof dbConfig.connectDB === 'function') {
  dbConfig.connectDB();
} else {
  console.log("⚠️ Warning: Could not execute connectDB. Check server/src/config/db.js");
}

// Middlewares
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/agent', agentRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString(), agenticCore: 'ACTIVE' });
});

// 404 & Global Error Handling
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Resource route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Smart Transit Guardian Server running on port ${PORT}`);
  // Start background perception agent
  startAutonomousFleetSupervisor();
});
