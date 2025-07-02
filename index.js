import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose"; // Import Mongoose
import { createServer } from "http";
import { Server } from "socket.io";
import initializeSockets from "./sockets/index.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Use morgan only in development mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/quizapp";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit if DB connection fails
  });

// MongoDB connection events
mongoose.connection.on("connected", () => {
  console.log("📚 Mongoose connected to DB");
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("⚠️ Mongoose disconnected from DB");
});

// Actual Routes
app.use("/api/quizzes", quizRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("Quiz Server is running!");
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbStatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  res.status(200).json({
    status: "healthy",
    dbStatus,
    timestamp: new Date(),
    socketRooms: io.sockets.adapter.rooms.size,
  });
});

// Initialize socket handlers
initializeSockets(io);

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔌 Socket.IO is listening on the same port`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔻 Received SIGINT. Closing server...");

  try {
    await mongoose.connection.close();
    console.log("📕 MongoDB connection closed");

    httpServer.close(() => {
      console.log("🛑 HTTP server closed");
      process.exit(0);
    });
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});
