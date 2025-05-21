import { Server } from "socket.io";

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:1234", // Replace with your frontend URL
      methods: ["GET", "POST"],
      credentials: true, // Allow credentials (cookies) to be sent
    },
  });
  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinChat", ({ userId, toUserId }) => {
      //   socket.join(toUserId);
      const room = [userId, toUserId].sort().join("_");
      socket.join(room);
      console.log(
        `User ${userId} joined the room with ID: ${toUserId} - ${room}`
      );
    });

    socket.on("sendMessage", ({ message, userId, userName, toUserId }) => {
      const room = [userId, toUserId].sort().join("_");

      io.to(room).emit("receiveMessage", {
        message,
        userId,
        userName,
        toUserId,
      });
      console.log(
        `Message sent from ${userId} to ${toUserId}: ${message} - ${room}`
      );
    });

    socket.on("disconnect", () => {
      console.log("A user disconnected:", socket.id);
    });
  });
  return io;
};
export default initializeSocket;
