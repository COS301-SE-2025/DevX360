import 'dotenv/config';
import mongoose from "mongoose";
import app from "./app.js";

mongoose.set('strictQuery', false);

class Server {
  constructor() {
    this.PORT = process.env.PORT || 5000;
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.server = null;
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  }

  async start() {
    if (!this.MONGODB_URI) {
      console.error("MONGODB_URI is not set. Check your .env file");
      process.exit(1);
    }

    if (!this.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set. Check your .env file");
      process.exit(1);
    }
    else{
      console.log("OPENAI_API_KEY is set.");
    }

    try {
      // Lambda-optimized MongoDB connection settings
      const mongooseOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 5, // Reduced for Lambda
        serverSelectionTimeoutMS: 15000, // 15 seconds
        socketTimeoutMS: 20000, // 20 seconds
        connectTimeoutMS: 15000, // 15 seconds
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      console.log("Connecting to MongoDB with URI:", this.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
      
      await mongoose.connect(this.MONGODB_URI, mongooseOptions);
      console.log("Connected to MongoDB Atlas");

      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('MongoDB reconnected');
      });

      this.server = app.listen(this.PORT, () => {
        console.log(`Server running on port ${this.PORT}`);
        console.log(`Health check: http://localhost:${this.PORT}/api/health`);
      });

      return this.server;
    } catch (error) {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    }
  }

  async stop() {
    if (this.server) {
      await new Promise(resolve => this.server.close(resolve));
      console.log('HTTP server closed');
    }
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new Server();
  server.start();

  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
}

export { Server };