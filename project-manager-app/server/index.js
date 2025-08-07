import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "cookie-session";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import * as Sentry from "@sentry/node";
import { body, validationResult } from "express-validator";
import logger from "./logger.js";
import "./config.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
// Sentry initialization
Sentry.init({
  dsn: process.env.SENTRY_DSN || "", // Set your Sentry DSN in .env
  tracesSampleRate: 1.0,
});

// Sentry request handler
app.use(Sentry.Handlers.requestHandler());

const app = express();
const PORT = process.env.PORT || 8080;
// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const allowedOrigin = "https://projexia-flax.vercel.app";
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("CORS origin:", origin);
      if (origin === allowedOrigin || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json()); // to parse JSON body

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

// Sentry error handler
app.use(Sentry.Handlers.errorHandler());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      logger.info(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => logger.error(err));
