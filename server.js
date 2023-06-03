require('dotenv').config(); 
// DATABASE
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
mongoose.set("strictQuery",true);


app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());
const PORT=process.env.PORT || 8080

// --------------------------------------------
// Routes 
const userRoutes = require("./Routes/userRoutes");
const chatRoutes = require("./Routes/chatRoutes");

// ----------------------------------------------

// ----------------------------------------------
//APIs
app.use("/api",userRoutes);
app.use("/api",chatRoutes);




// ----------------------------------------------


mongoose.connect(process.env.DATABASE,{   
}).then(()=>{   
    console.log("DB Connected..")
    console.log(`Port running on ${PORT}...`)
})

const server = require('http').createServer(app);


const io = require("socket.io")(server,{
    cors:{
        origin: "*"
    }
})

// Socket.IO event handling: The io.on("connection") event is triggered when a client connects to the Socket.IO server

io.on("connection",(socket)=>{
    
    socket.emit("ON",socket.id,socket.rooms);
    console.log(socket.id); 
    // Triggered when the client sends a "setup" event and passes user data. The client socket is joined to a room identified by the user's ID, and a "connected" event is emitted back to the client
    socket.on("setup", (userData) => {
        socket.join(userData._id); 
        socket.emit("connected",userData._id);
    })

    socket.on("join chat", (room) => {
        // Triggered when the client sends a "join chat" event and passes the room to join. The client socket is joined to the specified room
        console.log(socket.rooms);
        socket.join(room);
        socket.emit("connected rooms",socket.rooms);
    })

    socket.on("leave room", (room)=> {
         

        //  Triggered when the client sends a "leave room" event and passes the room to leave. The client socket is removed from the specified room
        if(!room) return ;
        socket.leave(room);
    })

    socket.on("new message", (newMessageRecieved) => {
        // Triggered when the client sends a "new message" event and passes a new message object (newMessageReceived). The event handler emits a "message received" event to each user in the chat, except the sender
        try{
            var chat = newMessageRecieved.chat;

            if(!chat.users) return console.log("chat users not defined");
    
            chat.users.forEach((user)=>{
                // console.log(user);
                if(user._id === newMessageRecieved.sender._id) {} 
                else {socket.in(user._id).emit("message received", newMessageRecieved);}
                
            })
        }
        catch(err){
            console.log("Error");
        }
      
    })

    // Triggered when the client sends a "typing" event and passes the room. The event is broadcasted to all clients in the room.
    socket.on("typing", (room) => socket.in(room).emit("typing"));

    // Triggered when the client sends a "stop typing" event and passes the room. The event is broadcasted to all clients in the room.
    socket.on("stop typing", (room) => {
        console.log(room);
        socket.in(room).emit("stop typing")
    });

    //  Triggered when the client disconnects. The socket leaves the room identified by the user's ID.
    socket.off("setup", (userData)=>{
        socket.leave(userData._id)
    })
})

server.listen(8080, () => console.log("Server is listening at 8080 .."))                                                  