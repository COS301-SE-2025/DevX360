import bcrypt from 'bcryptjs';

const testPassword = async () => {
  const password = "password123";

  const hashed = await bcrypt.hash(password, 12);
  console.log("Hashed password:", hashed);

  const isMatch = await bcrypt.compare("password123", hashed);
  console.log("✅ Match:", isMatch); // should print: true

  const isWrong = await bcrypt.compare("wrongPassword", hashed);
  console.log("❌ Wrong match:", isWrong); // should print: false
};

testPassword();
