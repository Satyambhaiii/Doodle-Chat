import './App.css';
import { DrawingBoard } from "./components/drawingBoard";
import { LoginComponent } from "./components/loginComponent";
import { Users } from "./components/users"
import { MessageBox } from "./components/messageBox"
import { NavBar } from "./components/navbar"
import { useRef, useEffect, useState } from "react";
import io from 'socket.io-client';

const socket = io("https://multiplayer-drawing-chat-room.herokuapp.com/");

const Room = ({ roomRef, selfUser, OverlayBackground }) => {
  return(
    <div ref={roomRef} id="roomRef">
      <NavBar socket={socket} OverlayBackground={OverlayBackground} roomRef={roomRef} selfUser={selfUser}/>
      <DrawingBoard socket={socket} selfUser={selfUser}/>
      <Users socket={socket}/>
      <MessageBox socket={socket} selfUser={selfUser}/>
    </div>
  )
}

function App() {
  const socketID = useRef(null);
  const OverlayBackground = useRef(null);
  const roomRef = useRef(null);

  const selfUser = useRef(null);
  selfUser.current = {roomID: 0};

  useEffect(() => {
    roomRef.current.style.display = "none";
      socket.on('connect', () => {
          if(socketID.current !== socket.id){
            OverlayBackground.current.style.display = "block";
            roomRef.current.style.display = "none";
            socketID.current = socket.id;
          }
      })

      socket.on("disconnect", () => {
        socket.emit("Delete", socket.id);
      });
  }, []);

  return (
    <div id="everythingHolder">
      <LoginComponent socket={socket} OverlayBackground={OverlayBackground} roomRef={roomRef} selfUser={selfUser}/>
      <Room roomRef={roomRef} selfUser={selfUser} OverlayBackground={OverlayBackground}/>
    </div>
  );
}

export default App;
