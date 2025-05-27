const mongoose = require("mongoose");

let instance = null;

class Database {
  constructor() {
    if (instance) {
      return instance;
    }

    this._connect();
    instance = this;
  }

  _connect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is not set in environment variables.");
      process.exit(1);
    }

    mongoose
      .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log("✅ MongoDB connected successfully");
      })
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
      });
  }
}

module.exports = new Database();
