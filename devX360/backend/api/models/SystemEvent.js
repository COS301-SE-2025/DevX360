// models/SystemEvent.js
import mongoose from "mongoose";

const systemEventSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g. "login_failure", "brute_force", "rate_limit"
  email: { type: String },
  ip: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed, // flexible structure for extra info
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("SystemEvent", systemEventSchema);