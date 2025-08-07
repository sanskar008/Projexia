const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Adjust the path to your User model

const BYPASS_AUTH = process.env.BYPASS_AUTH === "true";

// Google Auth Route
router.get(
  "/google",
  (req, res, next) => {
    if (BYPASS_AUTH) {
      // Directly redirect to callback bypassing Google
      return res.redirect("/auth/google/callback?bypass=true");
    }
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google Callback
router.get(
  "/google/callback",
  (req, res, next) => {
    if (req.query.bypass && BYPASS_AUTH) {
      // Create mock user session
      req.login(
        {
          displayName: "Test User",
          emails: [{ value: "test@example.com" }],
          id: "1234567890",
        },
        (err) => {
          if (err) return next(err);
          return res.redirect("http://localhost:8080");
        }
      );
    } else {
      next();
    }
  },
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:8080"); // your frontend URL
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.send("Logged out");
  });
});

// Get Current User
router.get("/current-user", (req, res) => {
  if (BYPASS_AUTH && !req.user) {
    return res.send({
      displayName: "Test User",
      emails: [{ value: "test@example.com" }],
      id: "1234567890",
    });
  }
  res.send(req.user || null);
});

// Email-Password Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide name, email, and password" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Email-Password Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // You can create a session here or issue a JWT as per your app's auth strategy
    // For now, just sending user info back without password
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
