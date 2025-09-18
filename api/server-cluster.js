import cluster from "cluster";
import os from "os";
import { Server } from "./server.js"; // Import your Server class

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master ${process.pid} is running`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Each worker creates its own server and MongoDB connection
  const server = new Server();
  server.start();
}