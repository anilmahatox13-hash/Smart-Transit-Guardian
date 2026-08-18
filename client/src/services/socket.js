import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('⚡ Connected to SmartTransit Real-Time Telemetry Socket:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Socket Disconnected:', reason);
});

export default socket;