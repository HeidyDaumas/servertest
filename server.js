const WebSocket = require('ws');

const PORT = process.env.PORT || 8080;
const server = new WebSocket.Server({ port: PORT });

server.on('connection', (socket) => {
    console.log('Client connected');

    // Mark each new connection as alive from the start.
    socket.isAlive = true;

    // Handle incoming messages.
    socket.on('message', (message) => {
        console.log('Received:', message);

        // Validate and forward only valid pattern data.
        if (isValidPattern(message)) {
            // Forward the full message (including any prefix) to all other clients.
            server.clients.forEach((client) => {
                if (client !== socket && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        } else {
            console.log('Invalid pattern, ignoring:', message);
        }
    });

    // When the server gets a pong from this client, mark it as alive again.
    socket.on('pong', () => {
        socket.isAlive = true;
    });

    // Log disconnection.
    socket.on('close', () => {
        console.log('Client disconnected');
    });
});

// Validation function: accepts either a waveform command (with optional hand prefix)
// OR a lamp command formatted as "lamp/<intensity>" where intensity is a number (integer or float) or "on"/"off".
function isValidPattern(message) {
    // Regex for lamp commands, e.g., "lamp/0.75", "lamp/on", "lamp/off"
    const lampRegex = /^lamp\/(?:on|off|\d+(?:\.\d+)?)$/;
    // Regex for waveform commands, e.g., "left|sine,1000,30000,5" or "sine,1000,30000,5"
    const waveformRegex = /^(?:(left|right)\|)?[a-zA-Z]+,\d+,\d+,\d+$/;
    
    return lampRegex.test(message) || waveformRegex.test(message);
}

// (Optional) Periodically ping clients and drop unresponsive ones...

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
