const { WebSocketServer } = require("ws");
const { verifyAccessToken } = require("../utils/authTokens");
const { User } = require("../models");
const { realtimeBroker } = require("../services/realtime.service");

const parseToken = (requestUrl) => {
  try {
    const parsed = new URL(requestUrl, "http://localhost");
    return parsed.searchParams.get("token");
  } catch {
    return null;
  }
};

const attachWebSocketServer = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (request, socket, head) => {
    if (!request.url?.startsWith("/ws")) {
      return;
    }

    const token = parseToken(request.url);

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\\r\\n\\r\\n");
      socket.destroy();
      return;
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\\r\\n\\r\\n");
      socket.destroy();
      return;
    }

    const user = await User.findById(decoded.sub).select("role accountStatus");
    if (!user || user.role !== "admin" || user.accountStatus !== "active") {
      socket.write("HTTP/1.1 403 Forbidden\\r\\n\\r\\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws) => {
    const unregister = realtimeBroker.registerClient(ws);
    ws.on("close", unregister);
  });

  return wss;
};

module.exports = {
  attachWebSocketServer
};
