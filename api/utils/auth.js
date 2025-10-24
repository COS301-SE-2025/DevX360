import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import MCPToken from "../models/MCPToken.js";
import SecurityAlert from "../models/SecurityAlert.js";

//unit tested
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

//unit tested
async function comparePassword(plainPassword, hashedPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plainPassword, hashedPassword, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

const defaultTokenOptions = { 
  expiresIn: "7d",
  algorithm: 'HS256'
};

//unit tested
function generateToken(
  payload,
  secret = process.env.JWT_SECRET,
  options = defaultTokenOptions
) {
  // Use synchronous signing since it's faster for our use case
  return jwt.sign(payload, secret, options);
}

const authenticateMCP = async (req, res, next) => {
  const token = req.header("x-mcp-token") || req.query.mcp_token;
  const clientIP = req.ip;
  
  if (!token) {
    return res.status(401).json({ 
      message: "MCP token required",
      hint: "Configure DEVX360_MCP_API_TOKEN in Claude Desktop config.json"
    });
  }
  
  try {
    // Priority 1: Check against user-generated tokens (database)
    const mcpToken = await MCPToken.validateToken(token, clientIP);
    
    if (mcpToken) {
      // Valid user token found
      req.mcpUser = mcpToken.userId;
      req.mcpTokenId = mcpToken._id;
      req.mcpTokenType = 'user';
      
      // ANOMALY DETECTION
      await detectAnomalousUsage(mcpToken, clientIP, req);
      
      return next();
    }
    
    // Priority 2: Fallback to system token for backward compatibility
    // (useful for admin tools or temporary access)
    if (process.env.MCP_API_TOKEN && token === process.env.MCP_API_TOKEN) {
      req.mcpUser = null; // System token, no specific user
      req.mcpTokenType = 'system';
      return next();
    }
    
    // Token is invalid or expired
    // Log invalid token attempt
    await SecurityAlert.create({
      type: 'invalid_token_attempt',
      severity: 'low',
      details: {
        message: 'Attempt to use invalid or expired token',
        tokenPreview: token.slice(-8)
      },
      context: {
        ip: clientIP,
        userAgent: req.get('user-agent'),
        endpoint: req.path,
        method: req.method
      }
    }).catch(err => console.error('Failed to log security alert:', err));
    
    return res.status(403).json({ 
      message: "Invalid or expired MCP token",
      hint: "Generate a new token from your DevX360 settings page"
    });
    
  } catch (error) {
    console.error('MCP authentication error:', error);
    return res.status(500).json({ 
      message: "Authentication error",
      error: error.message 
    });
  }
};

/**
 * Detect anomalous token usage patterns
 */
async function detectAnomalousUsage(mcpToken, clientIP, req) {
  try {
    const suspiciousPatterns = [];
    
    // Pattern 1: Token used from too many different IPs
    const uniqueIPs = new Set(mcpToken.authorizedDevice.ipAddresses.map(r => r.ip));
    if (uniqueIPs.size > 10) {
      suspiciousPatterns.push({
        type: 'multiple_ips',
        severity: 'high',
        details: {
          message: 'Token used from excessive number of IP addresses',
          uniqueIPCount: uniqueIPs.size,
          currentIP: clientIP
        }
      });
    }
    
    // Pattern 2: Check for impossible timeline (same token from distant IPs within short time)
    const recentUses = mcpToken.authorizedDevice.ipAddresses
      .filter(r => r.lastSeen && (Date.now() - r.lastSeen.getTime()) < 10 * 60 * 1000); // Last 10 minutes
    
    if (recentUses.length > 1) {
      // Different IPs used in last 10 minutes - potentially suspicious
      const ips = recentUses.map(r => r.ip);
      if (new Set(ips).size > 1) {
        suspiciousPatterns.push({
          type: 'impossible_timeline',
          severity: 'medium',
          details: {
            message: 'Token used from multiple IPs within 10 minutes',
            ips: ips,
            timeframe: '10 minutes'
          }
        });
      }
    }
    
    // Pattern 3: Rapid successive uses (potential automation/sharing)
    if (mcpToken.usageCount > 1000 && mcpToken.authorizedDevice.ipAddresses.length > 5) {
      suspiciousPatterns.push({
        type: 'token_sharing_suspected',
        severity: 'medium',
        details: {
          message: 'High usage count with multiple IPs suggests potential sharing',
          usageCount: mcpToken.usageCount,
          uniqueIPs: uniqueIPs.size
        }
      });
    }
    
    // Create security alerts for suspicious patterns
    for (const pattern of suspiciousPatterns) {
      // Check if we already alerted recently (avoid spam)
      const recentAlert = await SecurityAlert.findOne({
        userId: mcpToken.userId,
        tokenId: mcpToken._id,
        type: pattern.type,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      if (!recentAlert) {
        await SecurityAlert.create({
          type: pattern.type,
          severity: pattern.severity,
          userId: mcpToken.userId,
          tokenId: mcpToken._id,
          details: pattern.details,
          context: {
            ip: clientIP,
            userAgent: req.get('user-agent'),
            endpoint: req.path,
            method: req.method
          }
        });
        
        // Mark token as having suspicious activity
        if (pattern.severity === 'high' && !mcpToken.authorizedDevice.suspiciousActivityDetected) {
          mcpToken.authorizedDevice.suspiciousActivityDetected = true;
          await mcpToken.save();
        }
      }
    }
  } catch (error) {
    // Don't fail the request if anomaly detection fails
    console.error('Anomaly detection error:', error);
  }
}

export {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateMCP
};
