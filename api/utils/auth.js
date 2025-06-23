import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

//unit tested
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return await bcrypt.hash(password, salt);
}

//unit tested
async function comparePassword(plainPassword, hashedPassword) {
  console.log("Comparing:", plainPassword, "with", hashedPassword);
  const result = await bcrypt.compare(plainPassword, hashedPassword);
  console.log("Password match:", result);
  return result;
}

//unit tested
function generateToken(
  payload,
  secret = JWT_SECRET,
  options = { expiresIn: "7d" }
) {
  return jwt.sign(payload, secret, options);
}

export {
  hashPassword,
  comparePassword,
  generateToken,
};
