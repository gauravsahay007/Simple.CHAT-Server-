require('dotenv').config(); 
// DATABASE
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
mongoose.set("strictQuery",true);

// -------------------------------------------
// Parsers
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
// -------------------------------------------


const PORT=process.env.PORT || 8080


// --------------------------------------------
// Routes 
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
// ----------------------------------------------


// ----------------------------------------------
//APIs
app.use("/api",userRoutes);
app.use("/api",chatRoutes);
app.use("/api",messageRoutes);
// ----------------------------------------------




// ----------------------------------------------
// Database connection
mongoose.connect(process.env.DATABASE,{   
}).then(()=>{   
    console.log("DB Connected..")
    console.log(`Port running on ${PORT}...`)
})
// ----------------------------------------------




// ----------------------------------------------
// socket.io sever

const server = app.listen(
  PORT,
  console.log(`Server is running on Port: ${PORT}`)
);

const { Server } = require("socket.io");

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  // console.log("connected to socket.io");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("User Joined Room: " + room);
  });

  socket.on("leave room", (room) => {
    if (!room) return;
    socket.leave(room);
    // console.log("User Left Room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));

  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.off("setup", (userData) => {
    // console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});