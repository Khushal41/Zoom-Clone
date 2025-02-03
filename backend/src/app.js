// Load environment variables from a .env file
import dotenv from "dotenv";
dotenv.config();

// Import necessary modules
import express from "express"; // Express framework for building web applications
import { createServer } from "node:http"; // Node.js HTTP server
import { Server } from "socket.io"; // Socket.IO for real-time communication
import mongoose from "mongoose"; // Mongoose for MongoDB object modeling
import { connectToSocket } from "./controllers/socketManager.js"; // Custom function to manage socket connections
import cors from "cors"; // Middleware for enabling CORS (Cross-Origin Resource Sharing)
import { connect } from "node:http2"; // HTTP/2 support (not used in this code)

// Import user routes
import userRoutes from "./routes/users.routes.js"; // Routes for user-related API endpoints

// Create an instance of the Express application
const app = express();
// Create an HTTP server using the Express app
const server = createServer(app);
// Initialize Socket.IO with the server
const io = connectToSocket(server);

// Middleware to parse JSON request bodies
app.use(express.json());

// Set the port for the application, defaulting to 8000 if not specified in environment variables
app.set("port", process.env.PORT || 8000);

// Enable CORS for specified origins and methods
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Allow requests from the frontend URL
    methods: ["GET", "POST"], // Allow GET and POST methods
    allowedHeaders: ["*"], // Allow all headers
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);

// Middleware to parse URL-encoded request bodies with a limit of 40kb
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Use user routes for API endpoints under the /api/v1/users path
app.use("/api/v1/users", userRoutes);

// Function to start the server and connect to the database
const start = async () => {
  // Set MongoDB user (not used in this code)
  app.set("mongo_user");
  // Connect to MongoDB using the URL from environment variables
  const connectionDb = await mongoose.connect(process.env.MONGODB_URL);

  // Log the host of the connected MongoDB database
  console.log(`MONGO Connected DB Host: ${connectionDb.connection.host}`);
  // Start the server and listen on the specified port
  server.listen(app.get("port"), () => {
    console.log("LISTENING ON PORT 8000");
  });
};

// Start the application
start();