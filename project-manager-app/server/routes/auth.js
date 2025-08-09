const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register/Signup a new user
const handleRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Create new user
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    });

    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dev_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Register a new user
router.post("/register", handleRegister);

// Signup endpoint (same as register)
router.post("/signup", handleRegister);

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'dev_jwt_secret',
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userData = user.toObject();
    delete userData.password;

    res.json({ 
      token, 
      user: userData 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  // Since we're using JWT, the client should remove the token
  res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
    User.findById(decoded.userId)
      .select('-password')
      .then(user => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      })
      .catch(err => {
        console.error("Error finding user:", err);
        res.status(500).json({ message: "Server error" });
      });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// This route is intentionally left as a placeholder for future authentication endpoints

module.exports = router;
