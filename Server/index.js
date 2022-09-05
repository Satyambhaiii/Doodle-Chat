const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('build'));

const { createServer } = require('http');
const { Server } = require("socket.io");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://multiplayer-drawing-chat-room.herokuapp.com/"
  }
});

const rooms = {}
const users = {}
const image = {}

const connect = (user) => {
  if (user.roomID in rooms === false) {
    rooms[user.roomID] = new Set();
  }
  rooms[user.roomID].add(user.userID);
  users[user.userID] = user;
}

const disconnect = (id) => {
  console.log('user disconnected');
  if (id in users && "roomID" in users[id]) {
    const rID = users[id]["roomID"];
    rooms[rID].delete(id);
    delete users[id];
  }
}

app.get('/', (req, res) => {
  res.send("<div>Hello</div>")
});

io.on('connection', (socket) => {
  console.log('a user connected');

  const emitData = (roomID, selfID, message, data) => {
    rooms[roomID].forEach(userID => {
      console.log(userID, message);
      if(userID !== selfID){
        io.to(userID).emit(message, data);
      }
    });
  }

  socket.on("FindRoom", (room) => {
    let value = false;
    for(roomID in rooms){
      if(roomID === room) value = true;
    }
    socket.emit("RoomAvaialCheck", value);
  })

  socket.on("Image", (canvasState) => {
    emitData(canvasState.roomID, canvasState.userID, "Image", canvasState.image);
    image[canvasState.roomID] = canvasState.image;
  });

  socket.on("New message", (Message) => {
    const message = {
      "message": Message.message,
      "username": Message.username,
      "userID": Message.userID
    }
    emitData(Message.roomID, "", "Message", message);
  });

  socket.on("User", (user) => {
    let imageHolder = "";
    if(user.roomID in image === true) imageHolder = image[user.roomID];
    socket.emit("Image", imageHolder);
    connect(user);
    const roomUsers = {}
    for(newUser in users){
      if(users[newUser].roomID === user.roomID){
        roomUsers[newUser] = users[newUser];
      }
    }
    emitData(user.roomID, "", "UserListUpdate", roomUsers);
    emitData(user.roomID, "", "Message", {"username":"ADMIN", "message": user.username+" connected"});
    socket.emit("UserRecieved", user);
  });

  socket.on("Delete", (id) => {
    console.log("here in delete");
    disconnect(id);
    io.emit("UserListUpdate", users);
  })

  socket.on('disconnect', () => {
    console.log("here in disconnect")
    disconnect(socket.id);
    io.emit("UserListUpdate", users);
  });
});

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log('listening on *:3001');
});