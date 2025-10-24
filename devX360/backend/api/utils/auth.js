import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

const authenticateMCP = (req, res, next) => {
  const token = req.header("x-mcp-token") || req.query.mcp_token;
  if (!token) return res.status(401).json({ message: "MCP token required" });
  if (!process.env.MCP_API_TOKEN || token !== process.env.MCP_API_TOKEN) {
    return res.status(403).json({ message: "Invalid MCP token" });
  }
  next();
};

export {
  hashPassword,
  comparePassword,
  generateToken,
  authenticateMCP
};
