const WebSocket = require("ws");
const express = require("express");
const sequelize = require("./config/dbConfig");
const Message = require("./models/message.model");
const AdditionalMessage = require("./models/additionalMessage.model"); // Importar el nuevo modelo
const moment = require("moment-timezone");

const server = new WebSocket.Server({ port: 8080 });
const app = express();

const clients = new Map(); // Usar Map para asociar IDs de PLC con clientes

server.on("connection", (ws) => {
  console.log("New Client connected!");

  ws.on("message", async (message) => {
    try {
      const parsedMessage = JSON.parse(message);

      if (parsedMessage.type === "auth" && parsedMessage.plcId) {
        // Manejo de autenticación
        const plcId = parsedMessage.plcId;
        clients.set(plcId, ws);
        ws.plcId = plcId; // Guardar el ID del PLC en el WebSocket para referencia futura
        console.log(`Client authenticated for PLC ID: ${plcId}`);

        // Enviar mensaje de bienvenida
        const welcomeMessage = {
          type: "welcome",
          content: "Hello, this is the welcome message",
        };
        ws.send(JSON.stringify(welcomeMessage));
      } else if (
        ws.plcId &&
        parsedMessage.plcId === ws.plcId &&
        Array.isArray(parsedMessage.firstThree) &&
        Array.isArray(parsedMessage.additionalChunks)
      ) {
        // Procesar mensajes con el nuevo formato
        await handleNewMessageFormat(ws, parsedMessage);
      } else {
        // Si el mensaje no tiene la estructura esperada, rechazarlo
        throw new Error("Invalid message structure or unauthenticated client");
      }
    } catch (error) {
      console.error("Invalid JSON received or other error:", message, error);
      const errorMessage = {
        type: "error",
        content: "Invalid JSON format or other error",
      };
      ws.send(JSON.stringify(errorMessage));
    }
  });

  // Manejar desconexión del cliente
  ws.on("close", () => {
    if (ws.plcId) {
      clients.delete(ws.plcId);
    }
    console.log("Client disconnected");
  });

  // Manejar errores
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

async function handleNewMessageFormat(ws, parsedMessage) {
  if (!ws.plcId) {
    console.error("Client is not authenticated");
    const errorMessage = {
      type: "error",
      content: "Client is not authenticated",
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  // Almacenar las primeras tres variables en la base de datos con el ID del PLC
  await Message.create({
    plcId: ws.plcId,
    content: JSON.stringify(parsedMessage.firstThree),
  });

  // Almacenar los chunks adicionales en la base de datos con el ID del PLC
  for (const chunk of parsedMessage.additionalChunks) {
    await AdditionalMessage.create({
      plcId: ws.plcId,
      chunk: JSON.stringify(chunk),
    });
  }

  // Broadcast solo a clientes asociados con el mismo PLC ID
  clients.forEach((client, plcId) => {
    if (plcId === ws.plcId && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(parsedMessage));
    }
  });

  // Responder al remitente
  ws.send(
    JSON.stringify({
      type: "echo",
      content: parsedMessage,
    })
  );
}

// Endpoint para obtener los mensajes almacenados
app.get("/storedMessages/:plcId", async (req, res) => {
  try {
    const plcId = req.params.plcId;
    const messages = await Message.findAll({ where: { plcId } });

    // Convertir los timestamps a la zona horaria local
    const timezone = "America/Mexico_City";
    const messagesWithLocalTime = messages.map((msg) => {
      const localTimestamp = moment.utc(msg.timestamp).tz(timezone).format(); // Convertir desde UTC a zona horaria local
      return {
        ...msg.toJSON(),
        localTimestamp,
      };
    });

    res.json(messagesWithLocalTime);
  } catch (error) {
    console.error("Error fetching stored messages:", error);
    res.status(500).json({ error: "Error fetching stored messages" });
  }
});

// Sincronizar modelos con la base de datos
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synchronized");
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

// Iniciar servidor HTTP
const httpServer = app.listen(1880, () => {
  console.log("HTTP server is listening on port 1880");
});

console.log("WebSocket server is listening on port 8080");
