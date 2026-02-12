import express from "express";
import { clerkMiddleware } from "@clerk/express";

import authRoutes from "./routes/authRoutes";
import chatRoutes from "./routes/chatRoutes";
import messageRoutes from "./routes/messageRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json()); // parses incoming JSON req bodies and make the availble as req
app.use(clerkMiddleware());

app.get("/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running"});
})

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);


// Error handlers must come after all the routes and other middlewares so they can catch
// errors passed with next(err) or thrown inside async handlers
app.use(errorHandler);

export default app;
