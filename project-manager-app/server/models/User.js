import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  googleId: { type: String },
  photo: String,
});

// Indexes for optimization
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });

export default mongoose.model("User", userSchema);
