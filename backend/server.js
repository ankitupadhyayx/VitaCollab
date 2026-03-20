const express = require("express");
const path = require("path");
const http = require("http");
const app = require("./app");
const env = require("./utils/env");
const connectDb = require("./config/db");
const logger = require("./utils/logger");
const { ensureDefaultAdmin } = require("./utils/seedAdmin");
const { attachWebSocketServer } = require("./realtime/wsServer");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const startServer = async () => {
  await connectDb(env.mongodbUri);
  await ensureDefaultAdmin();

  const server = http.createServer(app);
  attachWebSocketServer(server);

  server.listen(env.port, () => {
    logger.info(`VitaCollab backend running on port ${env.port}`);
  });
};

startServer();
