import { io } from 'socket.io-client';

const endpoint = process.env.SOCKET_IO_URL ?? 'http://localhost:3000';
const timeout = Number(process.env.SOCKET_IO_TIMEOUT ?? 5000);

const socket = io(endpoint, {
  transports: ['websocket'],
  autoConnect: true,
});

const timer = setTimeout(() => {
  console.error(`WebSocket check timed out after ${timeout}ms while connecting to ${endpoint}`);
  socket.disconnect();
  process.exitCode = 1;
}, timeout);

socket.on('connect', () => {
  console.log(`WebSocket connection established with ${endpoint}`);
  clearTimeout(timer);
  socket.disconnect();
});

socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error.message ?? error);
  clearTimeout(timer);
  socket.disconnect();
  process.exitCode = 1;
});

socket.on('disconnect', (reason) => {
  console.log(`WebSocket disconnected: ${reason}`);
  clearTimeout(timer);
});
