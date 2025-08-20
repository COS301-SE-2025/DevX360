import 'dotenv/config';
import mongoose from "mongoose";
import app from "./app.js";

class Server {
  static instance = null;
  
  constructor() {
    if (Server.instance) {
      return Server.instance;
    }
    
    this.PORT = process.env.PORT || 5000;
    this.MONGODB_URI = process.env.MONGODB_URI;
    this.server = null;
    Server.instance = this;
  }

  async start() {
    if (!this.MONGODB_URI) {
      console.error("MONGODB_URI is not set. Check your .env file");
      process.exit(1);
    }

    try {
      await mongoose.connect(this.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB Atlas");

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

// Create and start the server instance
const server = new Server();
server.start();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await server.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stop();
  process.exit(0);
});

export default server;