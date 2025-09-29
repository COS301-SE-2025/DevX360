import mongoose from "mongoose";

const RepoMetricsSchema = new mongoose.Schema({
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
  metrics: Object,
  repositoryInfo: { type: Object, required: true },
  lastUpdated: Date,
  aiAnalysis: {
    insights: String,
    lastAnalyzed: Date,
    metadata: {
      repo: String,
      primaryLanguage: String,
      doraIndicatorsFound: Number,
      filesAnalyzed: Number,
      doraMetricsCovered: [String],
      processingTimeMs: Number
    },
    error: {
      message: String,
      stack: String,
      name: String
    },
  },
  memberStats: {
    type: Map,
    of: new mongoose.Schema({
      githubUsername: String,
      commits: {
        total: Number,
        recent: Number
      },
      pullRequests: {
        total: Number,
        merged: Number,
        open: Number,
        closed: Number
      },
      issues: {
        total: Number,
        open: Number,
        closed: Number
      },
      activityScore: Number,
      lastActivity: Date,
      collectedAt: Date
    }),
    default: {}
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
});

RepoMetricsSchema.index({ teamId: 1 }, { unique: true });

export default mongoose.model("RepoMetrics", RepoMetricsSchema);