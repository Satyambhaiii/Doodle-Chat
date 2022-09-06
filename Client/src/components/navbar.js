import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect, useState, useContext } from "react";

const NavBar = ({ socket, OverlayBackground, roomRef, selfUser }) => {
    const roomID = useRef(null);

    const Hover = (value) => {
        if(value === 1){
            roomID.current.style.color = "grey"
            roomID.current.innerHTML = "Click here to copy to clipboard";
        }
        else{
            roomID.current.style.color = "black"
            roomID.current.innerHTML = selfUser.current.roomID;
        }
    }

    useEffect(() => {
        socket.on("UserRecieved", user => {
            selfUser.current = user
            Hover(0);
        });
    }, []);

    const copyToCliboard = () => {
        navigator.clipboard.writeText(selfUser.current.roomID);
        roomID.current.style.color = "grey"
        roomID.current.innerHTML = "Room ID copied to clipboard!";
        setTimeout(() => {
            Hover(0);
        }, 1000)
    }

    return(
        <div id="navbar" style={{display: "flex", justifyContent: "space-between"}}>
            <div style={{height: "40px", width: "auto", margin: "5px 0px 0px 0px", display: "flex", placeItems: "center", fontSize: "20px"}}>
                Room ID:&nbsp;
                <div 
                className="navBarButtons" 
                style={{height: "40px", minWidth: "40px", display: "flex", placeItems: "center"}} 
                ref={roomID} 
                onClick={() => copyToCliboard()} 
                onMouseEnter={() => Hover(1)} onMouseLeave={() => Hover(0)} />
            </div>
        </div>
    )
}

export { NavBar };