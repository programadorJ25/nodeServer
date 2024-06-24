const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const clients = new Set();

server.on("connection", (ws) => {
  clients.add(ws);
  console.log("New Client connected!");

  // Welcome message
  const welcomeMessage = {
    type: "welcome",
    content: "Hello, this is the welcome message",
  };
  ws.send(JSON.stringify(welcomeMessage));

  // Handle incoming messages
  ws.on("message", (message) => {
    try {
      const parsedMessage = JSON.parse(message);
      console.log("Received message:", parsedMessage);

      // Broadcast to all clients
      clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(parsedMessage));
        }
      });

      // Respond to sender
      ws.send(
        JSON.stringify({
          type: "echo",
          content: parsedMessage,
        })
      );
    } catch (error) {
      console.error("Invalid JSON received:", message);
      const errorMessage = {
        type: "error",
        content: "Invalid JSON format",
      };
      ws.send(JSON.stringify(errorMessage));
    }
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  // Handle client disconnection
  ws.on("close", () => {
    clients.delete(ws);
    console.log("Client disconnected");
  });
});

console.log("WebSocket server is listening on port 8080");
