import mongoose from "mongoose";

const RepoMetricsSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  repoUrl: { type: String, required: true },
  owner: String,
  repo: String,
  metrics: Object,
  lastUpdated: Date
});

export default mongoose.model("RepoMetrics", RepoMetricsSchema);