import mongoose from 'mongoose';

const securityAlertSchema = new mongoose.Schema({
  // Alert type
  type: {
    type: String,
    required: true,
    enum: [
      'suspicious_token_usage',
      'multiple_ips',
      'impossible_timeline',
      'rate_limit_exceeded',
      'token_sharing_suspected',
      'expired_token_attempt',
      'invalid_token_attempt',
      'admin_token_revocation',
      'admin_bulk_revocation'
    ],
    index: true
  },
  
  // Severity
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Related entities
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  tokenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MCPToken',
    index: true
  },
  
  // Alert details
  details: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  
  // Context
  context: {
    ip: String,
    userAgent: String,
    endpoint: String,
    method: String
  },
  
  // Status
  status: {
    type: String,
    enum: ['new', 'investigating', 'resolved', 'false_positive'],
    default: 'new',
    index: true
  },
  
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for performance
securityAlertSchema.index({ userId: 1, createdAt: -1 });
securityAlertSchema.index({ type: 1, status: 1 });
securityAlertSchema.index({ severity: 1, status: 1 });

export default mongoose.model('SecurityAlert', securityAlertSchema);

