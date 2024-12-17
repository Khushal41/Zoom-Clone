import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

import mongoose from "mongoose";
import { connectToSocket } from "./controllers/socketManager.js";


import cors from "cors";
import userRoutes from "./routes/users.routes.js";

const app = express();
const server = createServer(app);
const io = connectToSocket(server, {
    cors: {
        origin: "*",
        method: ["GET", "POST"],
        allowedHeaders: ["*"],
        Credential: true
    }
}); // Initialize Socket.IO


// Set port
app.set("port", process.env.PORT || 3000);
// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));



// // Sample route
// app.get("/home", (req, res) => {
//     return res.json({ hello: "World" });
// });

app.use("/api/v1/users", userRoutes);

// Start the server
const start = async () => {
    app.set("mongo_user")
    const connectionDb = await mongoose.connect("mongodb+srv://khushalbhavsar41:LDtRuuU1CvO7DXCm@cluster0.q1y56.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

    console.log(`MONGO Connected DB HOst: ${connectionDb.connection.host}`)
    server.listen(app.get("port"), () => {
        console.log("LISTENIN ON PORT 3000")
    });
}

start();
