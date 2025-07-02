import quizSocket from "./quizSocket.js";

export default function initializeSockets(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    quizSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
