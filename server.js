const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

// Number of allowed missed pings before terminating
const MAX_MISSED_PINGS = 2;
const PING_INTERVAL = 30000; // 30 seconds

server.on('connection', (socket) => {
    console.log('Client connected');
    // Track how many pings the client has missed
    socket.missedPings = 0;
    socket.isAlive = true; // Mark it alive initially

    socket.on('message', (message) => {
        console.log('Received:', message);

        // Validate and forward only valid pattern data
        if (isValidPattern(message)) {
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            console.log('Invalid pattern, ignoring:', message);
        }
    });

    // On receiving a pong, mark the socket as alive
    socket.on('pong', () => {
        socket.isAlive = true;
        socket.missedPings = 0;
    });

    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Function to validate pattern format
function isValidPattern(message) {
    const patternRegex = /^\d+,\d+,\d+$/; // Matches "frequency,amplitude,duration"
    return patternRegex.test(message);
}

// Heartbeat to keep connections alive
// We ping each client; if they miss too many pings, we assume they're dead.
setInterval(() => {
    server.clients.forEach((socket) => {
        if (socket.readyState !== WebSocket.OPEN) {
            return;
        }

        if (!socket.isAlive) {
            socket.missedPings++;
            console.log(`Socket missed ping #${socket.missedPings}`);

            // Terminate only if it missed pings multiple times in a row
            if (socket.missedPings >= MAX_MISSED_PINGS) {
                console.log('Terminating unresponsive socket');
                return socket.terminate();
            }
        }

        // Mark as not alive until they respond with pong
        socket.isAlive = false;

        // Send ping frame; ws library will auto-handle the “pong” event
        socket.ping();
    });
}, PING_INTERVAL);

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
