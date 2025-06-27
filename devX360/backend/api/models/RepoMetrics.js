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
    }
  },
  analysisStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
});

export default mongoose.model("RepoMetrics", RepoMetricsSchema);