import express from "express";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import env from "dotenv";
import cors from "cors";
import http from "http";
env.config();
console.log(env);
const app = express();
const PORT = process.env.PORT || 3000;

// Import routers
import authenticationRouter from "./routers/authenticationRouter.js";
import profileRouter from "./routers/profileRouter.js";
import requestRouter from "./routers/requestRouter.js";
import userRouter from "./routers/userRouter.js";
import initializeSocket from "./utils/socket.js";
app.use(
  cors({
    origin: "http://localhost:1234", // Replace with your frontend URL
    credentials: true, // Allow credentials (cookies) to be sent
  })
);
app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use("/", authenticationRouter); // Authentication routes
app.use("/", profileRouter); // Profile routes
app.use("/", requestRouter); // Connection request routes
app.use("/", userRouter); // User routes

const server = http.createServer(app);
initializeSocket(server); // Initialize socket.io

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
