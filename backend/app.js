const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");

const routes = require("./routes");
const { apiLimiter } = require("./middleware/rateLimit.middleware");
const { requestLogger } = require("./middleware/request.middleware");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");
const env = require("./utils/env");

const app = express();
app.set("trust proxy", 1);
const isProd = env.nodeEnv === "production";

const allowedOrigins = new Set(
  isProd
    ? env.corsOrigins || ["https://vitacollab.in", "https://www.vitacollab.in"]
    : env.corsOrigins || ["http://localhost:3000"]
);

app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true
  })
);
app.use(compression());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(hpp());
app.use(mongoSanitize());
app.use(requestLogger);

app.use("/api", apiLimiter);
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to VitaCollab API"
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
