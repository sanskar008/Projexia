import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import session from "cookie-session";
import passport from "passport";
import cors from "cors";
import "./config.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigin = "https://projexia-flax.vercel.app";

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

app.use(
  session({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY],
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error(err));
