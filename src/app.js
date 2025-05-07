import express from "express";
import connectDB from "./config/database.js";
import cookieParser from "cookie-parser";
import env from "dotenv";
env.config();
console.log(env);
const app = express();
const PORT = process.env.PORT || 3000;

// Import routers
import authenticationRouter from "./routers/authenticationRouter.js";
import profileRouter from "./routers/profileRouter.js";
import requestRouter from "./routers/requestRouter.js";

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(cookieParser()); // Middleware to parse cookies

app.use("/", authenticationRouter); // Authentication routes
app.use("/", profileRouter); // Profile routes
app.use("/", requestRouter); // Connection request routes

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
