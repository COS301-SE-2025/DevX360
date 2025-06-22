const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

//unit tested
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

//unit tested
async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

//unit tested
function generateToken(payload, secret = JWT_SECRET, options = { expiresIn: '7d' }) {
  return jwt.sign(payload, secret, options);
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
