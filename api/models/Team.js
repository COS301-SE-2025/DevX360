import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

teamSchema.index({ creator: 1 });
teamSchema.index({ name: 1, password: 1 }); // For team join operations

teamSchema.index({ name: 1 }, { unique: true });
teamSchema.index({ members: 1 });

export default mongoose.model("Team", teamSchema);
