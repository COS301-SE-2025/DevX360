import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

export default mongoose.model("Team", teamSchema);
