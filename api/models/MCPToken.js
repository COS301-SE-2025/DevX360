import mongoose from 'mongoose';
import crypto from 'crypto';

const mcpTokenSchema = new mongoose.Schema({
  // The actual token value (hashed for security)
  tokenHash: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  
  // User who owns this token
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    index: true
  },
  
  // Human-readable name for the token
  name: { 
    type: String, 
    required: true,
    default: 'Claude Desktop',
    maxlength: 100
  },
  
  // Last 8 characters (for display only, not security)
  tokenPreview: {
    type: String,
    required: true
  },
  
  // Tracking
  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  
  // Control
  isActive: { type: Boolean, default: true },
  
  // Usage tracking
  usageCount: { type: Number, default: 0 },
  
  // Device and IP tracking for anomaly detection
  authorizedDevice: {
    firstSeenIP: { type: String },
    lastSeenIP: { type: String },
    ipAddresses: [{ 
      ip: String,
      firstSeen: { type: Date, default: Date.now },
      lastSeen: { type: Date, default: Date.now },
      useCount: { type: Number, default: 1 }
    }],
    suspiciousActivityDetected: { type: Boolean, default: false }
  }
});

// Indexes for performance
mcpTokenSchema.index({ userId: 1, isActive: 1 });
mcpTokenSchema.index({ expiresAt: 1 });
mcpTokenSchema.index({ tokenHash: 1, isActive: 1 });

/**
 * Validate a plain text token and return the token document if valid
 * Also updates lastUsedAt, usageCount, and tracks IP addresses
 */
mcpTokenSchema.statics.validateToken = async function(plainToken, clientIP = null) {
  if (!plainToken || typeof plainToken !== 'string') {
    return null;
  }
  
  // Hash the provided token
  const tokenHash = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');
    
  // Find the token
  const token = await this.findOne({ 
    tokenHash,
    isActive: true 
  }).populate('userId', 'name email githubAccessToken githubScopes githubUsername');
  
  if (!token) {
    return null;
  }
  
  // Check expiration
  if (token.expiresAt && token.expiresAt < new Date()) {
    return null;
  }
  
  // Update last used timestamp and usage count
  token.lastUsedAt = new Date();
  token.usageCount = (token.usageCount || 0) + 1;
  
  // Track IP address if provided
  if (clientIP) {
    if (!token.authorizedDevice.firstSeenIP) {
      token.authorizedDevice.firstSeenIP = clientIP;
    }
    token.authorizedDevice.lastSeenIP = clientIP;
    
    // Find or create IP record
    const ipRecord = token.authorizedDevice.ipAddresses.find(record => record.ip === clientIP);
    if (ipRecord) {
      ipRecord.lastSeen = new Date();
      ipRecord.useCount = (ipRecord.useCount || 0) + 1;
    } else {
      token.authorizedDevice.ipAddresses.push({
        ip: clientIP,
        firstSeen: new Date(),
        lastSeen: new Date(),
        useCount: 1
      });
    }
  }
  
  await token.save();
  
  return token;
};

/**
 * Generate a secure token hash from plain text
 */
mcpTokenSchema.statics.hashToken = function(plainToken) {
  return crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');
};

/**
 * Clean up expired tokens (can be run periodically)
 */
mcpTokenSchema.statics.cleanupExpired = async function() {
  const result = await this.updateMany(
    {
      expiresAt: { $lt: new Date() },
      isActive: true
    },
    { 
      isActive: false 
    }
  );
  
  return result.modifiedCount;
};

export default mongoose.model('MCPToken', mcpTokenSchema);

