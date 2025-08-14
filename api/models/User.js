import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true, default: "user" },
  githubId: { type: String, unique: true, sparse: true, default: null },
  githubUsername: {type: String, default: null},
  isEmailVerified: { type: Boolean, default: false },
  inviteCode: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  avatar: { type: String, default: null },
});

// tested
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
