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

export {
  hashPassword,
  comparePassword,
  generateToken,
};
