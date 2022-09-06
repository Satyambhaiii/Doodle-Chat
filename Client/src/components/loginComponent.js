import { faToggleOff } from "@fortawesome/free-solid-svg-icons";
import { useRef, useEffect, useState, useContext } from "react";

const LoginComponent = ({ socket, OverlayBackground, roomRef, selfUser }) => {
    const pic = useRef(null);
    const roomID = useRef(null);
    const username = useRef(null);
    const canvasPic = useRef(null), ctxPic = useRef(null);

    const [name, updateName] = useState("");
    const [roomName, updateRoomName] = useState("");

    useEffect(() => {
        canvasPic.current = pic.current;
        ctxPic.current = canvasPic.current.getContext('2d');
        createPic();
    }, []);

    const createPic = () => {
        let r = Math.random() * 255, g = Math.random() * 255, b = Math.random() * 255;

        ctxPic.current.fillStyle = "rgb("+r+","+g+","+b+")";
        ctxPic.current.fillRect(0,0,canvasPic.current.width, canvasPic.current.height)
        
        r = Math.random() * 255;
        g = Math.random() * 255; 
        b = Math.random() * 255;

        ctxPic.current.fillStyle = "rgb("+r+","+g+","+b+")";

        let w = 20;
        for(let i=0; i<25; i++){
            let x = Math.floor((Math.random() * 100) / w) * w;
            let y = Math.floor((Math.random() * 200) / w) * w;

            ctxPic.current.fillRect(x, y, w, w);
            ctxPic.current.fillRect(200-w-1-x, y, w, w);
        }
    }

    const toggleInput = (toggleValue) => {
        if(roomID.current === null) return;
        if(toggleValue === 0){
            roomID.current.disabled = true;
            updateRoomName("Room ID will be set automatically");
        }
        else{
            roomID.current.disabled = false;
            updateRoomName("");
        }
    }

    const SendData = (getRoom) => {
        const dataSendFunction = (value) => {
            updateRoomName(value);
            const user = {
                "displayPic": canvasPic.current.toDataURL('image/jpeg', 1),
                "username": name,
                "userID": socket.id,
                "roomID": value
            }
            selfUser.current = user;
            socket.emit("User", user);
            OverlayBackground.current.style.display = "none";
            roomRef.current.style.display = "";
            if(getRoom === 1) toggleInput(0);
        }
        if(name.length < 3 || roomName === null) return;
        if(getRoom){
            dataSendFunction(socket.id);
        }
        else{
            dataSendFunction(roomName);
        }
    }

    const usernameSubmit = () => {
        const displayError = (stateValue, stateUpdate, referenceID, errorMessage) => {
            let inputField = referenceID.current;
            let valueHolder = stateValue;
            stateUpdate(errorMessage);

            inputField.style.borderColor = "red";
            inputField.style.color = "grey";
            setTimeout(() => {
                inputField.style.borderColor = "blue";
                inputField.style.color = "black";

                stateUpdate(valueHolder);
            }, 500);
        }

        if(name.length < 3) displayError(name, updateName, username, "min length 3");
        if(roomID.current.disabled === false){
            socket.emit("FindRoom", roomName);
            socket.on("RoomAvaialCheck", value => {
                if(!value){
                    displayError(roomName, updateRoomName, roomID, "Room not available!");
                }
                else{
                    SendData(0);
                }
            });
        }
        else{
            SendData(1);
        }
    }

    return(
        <div id="OverlayBackground" ref={OverlayBackground}>
            <div id="Login">
                <canvas 
                    ref={pic}
                    className="pic"
                    width={200}
                    height={200}
                    onClick={createPic}
                    style={{margin: "40px auto"}}
                />

                <input className="LoginInput" ref={username}
                value={name}
                placeholder="Enter your username" 
                onKeyDown={(event) => {
                    if(event.key === 'Enter') usernameSubmit();
                }}
                onChange={(event) => updateName(event.target.value)} 
                required minLength="3" maxLength="14"/>

                <div style={{width: "fit-content", margin: " 10px auto -10px auto"}}>
                    <label className="radio-inline">
                    <input type="radio" name="optradio"
                    onClick={() => toggleInput(0)} />Create Room
                    </label>
                    <label className="radio-inline">
                    <input type="radio" name="optradio" defaultChecked
                    onClick={() => toggleInput(1)} />Join Room
                    </label>
                </div>
                
                <input className="LoginInput" ref={roomID}
                disabled={false}
                value={roomName}
                placeholder="Enter room ID" 
                onKeyDown={(event) => {
                    if(event.key === 'Enter') usernameSubmit();
                }}
                onChange={(event) => updateRoomName(event.target.value)} 
                required minLength="3" maxLength="20"/>

                <button className="submitButton"
                onClick={usernameSubmit}>Enter</button>

                <div style={{margin: "20px auto", width: "fit-content"}}>
                    <ul style={{color: "#F9F2ED", padding: "20px"}}>
                        <li>Username needs to be of length from 3 to 20.</li>
                        <li>Avatar can be changed by clicking on it.</li>
                        <li>Creating room auto generates ID.</li>
                        <li>Room is deleted when everybody leaves.</li>
                    </ul>
                </div>
                
            </div>
        </div>
    )
}

export { LoginComponent };