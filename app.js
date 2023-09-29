// Start listening on different ports
const expressPort = 3000;
const wsPort = 3001;

const http = require('./http');
const ws = require('./websocket');
const db = require('./database')();

http.listen(expressPort, () => {
  console.log(`Express app listening on port ${expressPort}`);
});

ws.listen(wsPort, () => {
  console.log(`WebSocket server listening on port ${wsPort}`);
});
