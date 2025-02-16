import { Server } from "socket.io";

// Object to store active connections in different call rooms
let connections = {};

// Object to store chat messages for different call rooms
let messages = {};

// Object to store the time when a user joined the call
let timeOnline = {};

// Function to initialize and set up the Socket.io server
export const connectToSocket = (server) => {
  // Creating a new Socket.io server instance
  const io = new Server(server, {
    cors: {
      origin: "*", // Allowing all origins
      methods: ["GET", "POST"], // Allowing only GET and POST requests
      allowedHeaders: ["*"], // Allowing all headers
      credentials: true, // Allowing credentials to be sent
    },
  });

  // Listening for new client connections
  io.on("connection", (socket) => {
    console.log("SOMETHING CONNECTED"); // Logging when a client connects

    // Handling user joining a call
    socket.on("join-call", (path) => {
      // If the room doesn't exist, create an empty array for it
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      // Add the new socket connection to the room
      connections[path].push(socket.id);

      // Store the time when the user joined
      timeOnline[socket.id] = new Date();

      // Notify all users in the room about the new user
      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      // If there are previous messages in the room, send them to the new user
      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; ++a) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"], // Message content
            messages[path][a]["sender"], // Sender name
            messages[path][a]["socket-id-sender"] // Sender's socket ID
          );
        }
      }
    });

    // Handling WebRTC signaling between users
    socket.on("signal", (toId, message) => {
      // Forward the signal data to the target user
      io.to(toId).emit("signal", socket.id, message);
    });

    // Handling chat messages
    socket.on("chat-message", (data, sender) => {
      // Find the room in which the sender is present
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([room, isFound], [roomKey, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true]; // Found the room
          }
          return [room, isFound];
        },
        ["", false]
      );

      // If the user is in a room, store and broadcast the message
      if (found === true) {
        // Initialize messages array if not already created for the room
        if (messages[matchingRoom] === undefined) {
          messages[matchingRoom] = [];
        }

        // Save the message in the room's chat history
        messages[matchingRoom].push({
          sender: sender,
          data: data,
          "socket-id-sender": socket.id,
        });

        console.log("message", matchingRoom, ":", sender, data);

        // Send the message to all users in the room
        connections[matchingRoom].forEach((elem) => {
          io.to(elem).emit("chat-message", data, sender, socket.id);
        });
      }
    });

    // Handling user disconnection
    socket.on("disconnect", () => {
      // Calculate how long the user was online
      var diffTime = Math.abs(timeOnline[socket.id] - new Date());

      var key;

      // Loop through all rooms and remove the disconnected user
      for (const [k, v] of JSON.parse(
        JSON.stringify(Object.entries(connections))
      )) {
        for (let a = 0; a < v.length; ++a) {
          if (v[a] === socket.id) {
            key = k;

            // Notify all users in the room that someone has left
            for (let a = 0; a < connections[key].length; ++a) {
              io.to(connections[key][a]).emit("user-left", socket.id);
            }

            // Remove the user from the room
            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            // If the room is empty, delete it
            if (connections[key].length === 0) {
              delete connections[key];
            }
          }
        }
      }
    });
  });

  return io; // Returning the Socket.io instance
};
