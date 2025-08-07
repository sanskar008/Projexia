import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";

const router = express.Router();

// Signup
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name, email, password } = req.body;
      const existing = await User.findOne({ email });
      if (existing) {
        return res
          .status(400)
          .json({ message: "User with this email already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        email
      )}`;
      const user = new User({
        name,
        email,
        password: hashedPassword,
        avatarUrl,
      });
      await user.save();
      res
        .status(201)
        .json({
          id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          role: user.role,
        });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Login
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

// Update user avatar
router.put(
  "/me/avatar",
  [
    body("userId").notEmpty().withMessage("userId is required"),
    body("avatarUrl").isURL().withMessage("Valid avatarUrl is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { userId, avatarUrl } = req.body;
      const User = require("../models/User.js");
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.avatarUrl = avatarUrl;
      await user.save();
      res.json({ message: "Avatar updated", avatarUrl });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  }
);

export default router;
