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
    index: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email",
    ],
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true, default: "user" },
  githubId: { type: String, unique: true, sparse: true, default: undefined },
  githubUsername: {type: String, default: null},
  isEmailVerified: { type: Boolean, default: false },
  inviteCode: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  avatar: { type: String, default: null },
});

userSchema.index({ email: 1 }, { unique: true });
// userSchema.index({ email: 1, password: 1 }); // For login queries
userSchema.index({ lastLogin: -1 }); // For sorting
userSchema.index({ githubId: 1 });
userSchema.index({ githubUsername: 1 });
userSchema.index({ inviteCode: 1 });

// tested
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
