const mongoose = require("mongoose");

const RepoMetricsSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  repoUrl: { type: String, required: true },
  owner: String,
  repo: String,
  metrics: Object,
  lastUpdated: Date
});

module.exports = mongoose.model("RepoMetrics", RepoMetricsSchema);