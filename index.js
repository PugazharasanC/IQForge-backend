import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { server as socketIoServer } from "socket.io";
import initializeSockets from "./sockets";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
const io = new socketIoServer(3001, {
  cors: {
    origin: "*",
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Use morgan only in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Example route
app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

initializeSockets(io);
