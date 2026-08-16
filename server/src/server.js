require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// Initialize database connection
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buses', require('./routes/busRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/emergencies', require('./routes/emergencyRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});