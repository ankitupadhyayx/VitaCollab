const net = require("net");
const env = require("../utils/env");
const logger = require("../utils/logger");

const CHUNK_SIZE_BYTES = 64 * 1024;

const createScanLogMeta = ({ fileId, scanMode, result, reason = null }) => ({
  fileId,
  scanMode,
  result,
  reason,
  timestamp: new Date().toISOString()
});

const scanWithClamAv = (buffer) => new Promise((resolve, reject) => {
  const socket = net.createConnection({
    host: env.clamavHost,
    port: env.clamavPort
  });

  let response = "";
  let settled = false;

  const cleanup = () => {
    if (!socket.destroyed) {
      socket.destroy();
    }
  };

  const finish = (callback) => {
    if (settled) {
      return;
    }
    settled = true;
    callback();
  };

  const timeout = setTimeout(() => {
    finish(() => {
      cleanup();
      reject(new Error("ClamAV scan timed out"));
    });
  }, env.clamavTimeoutMs);

  socket.on("connect", () => {
    try {
      socket.write("zINSTREAM\0");

      let offset = 0;
      while (offset < buffer.length) {
        const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE_BYTES, buffer.length));
        const lengthPrefix = Buffer.alloc(4);
        lengthPrefix.writeUInt32BE(chunk.length, 0);
        socket.write(lengthPrefix);
        socket.write(chunk);
        offset += chunk.length;
      }

      const eof = Buffer.alloc(4);
      eof.writeUInt32BE(0, 0);
      socket.write(eof);
    } catch (error) {
      finish(() => {
        clearTimeout(timeout);
        cleanup();
        reject(error);
      });
    }
  });

  socket.on("data", (data) => {
    response += data.toString("utf8");
  });

  socket.on("error", (error) => {
    finish(() => {
      clearTimeout(timeout);
      cleanup();
      reject(error);
    });
  });

  socket.on("end", () => {
    finish(() => {
      clearTimeout(timeout);
      cleanup();

      const normalized = String(response || "").trim();
      if (normalized.includes("FOUND")) {
        resolve({ clean: false, reason: "infected" });
        return;
      }

      if (normalized.includes("OK")) {
        resolve({ clean: true, reason: null });
        return;
      }

      reject(new Error(`Unexpected ClamAV response: ${normalized || "<empty>"}`));
    });
  });
});

const scanFile = async (buffer, fileId) => {
  const id = fileId || "unknown-file";

  if (!env.clamavEnabled) {
    logger.info("Mock scan used", createScanLogMeta({
      fileId: id,
      scanMode: "mock",
      result: "clean"
    }));

    return {
      clean: true,
      scanMode: "mock",
      reason: null
    };
  }

  try {
    const result = await scanWithClamAv(buffer);

    logger.info("File scan completed", createScanLogMeta({
      fileId: id,
      scanMode: "real",
      result: result.clean ? "clean" : "infected",
      reason: result.reason
    }));

    return {
      clean: Boolean(result.clean),
      scanMode: "real",
      reason: result.reason || null
    };
  } catch (error) {
    logger.error("ClamAV scan failed", createScanLogMeta({
      fileId: id,
      scanMode: "real",
      result: "scanner_error",
      reason: error.message
    }));

    return {
      clean: false,
      scanMode: "real",
      reason: "scanner_unreachable"
    };
  }
};

module.exports = {
  scanFile
};
