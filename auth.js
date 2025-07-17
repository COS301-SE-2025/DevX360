import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//unit tested
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

//unit tested
async function comparePassword(plainPassword, hashedPassword) {
  const result = await bcrypt.compare(plainPassword, hashedPassword);
  return result;
}

//unit tested
function generateToken(
  payload,
  secret = process.env.JWT_SECRET,
  options = { expiresIn: "7d" }
) {
  return jwt.sign(payload, secret, options);
}

export {
  hashPassword,
  comparePassword,
  generateToken,
};
