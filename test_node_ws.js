const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8000/ws/events');

ws.on('open', function open() {
  console.log('connected');
});

ws.on('message', function incoming(data) {
  console.log('received:', data.toString().substring(0, 100));
  process.exit(0);
});

ws.on('close', function close() {
  console.log('disconnected');
  process.exit(1);
});

ws.on('error', function error(err) {
  console.error('error:', err);
  process.exit(1);
});
