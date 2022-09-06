import { useRef, useEffect, useState } from "react";

const Message = ({ data, selfUser }) => {
    let usernameCol = "darkslategrey", messageCol = "darkslategrey";
    if(data.username === "ADMIN"){
        usernameCol = "#F87474";
        messageCol = "#F87474";
    }
    else if(data.userID === selfUser.current.userID){
        data.username = "SELF"
        usernameCol = "green";
    }
    return(
        <div className="messageData">
            <span style={{color: usernameCol}}>{data.username}:</span>&nbsp;
            <span style={{color: messageCol}}>{data.message}</span>
        </div>
    )
}

const Input = ({ socket, selfUser }) => {
    const [message, updateMessage] = useState("");

    return(
        <input id="messageInput"
        value={message}
        onChange={(event) => updateMessage(event.target.value)}
        onKeyDown={(event) => {
            if(event.key === 'Enter'){
                const Message = {
                    "message": message,
                    "username": selfUser.current.username,
                    "roomID": selfUser.current.roomID,
                    "userID": selfUser.current.userID
                }
                socket.emit("New message", Message);
                updateMessage('');
            } 
        }}
        />
    )
}

const MessageBox = ({ socket, selfUser }) => {
    const messageBox = useRef(null);
    const [MessageList, updateMessage] = useState([]);

    useEffect(() => {
        socket.on("Message", (data) => {
            updateMessage((prevMessageList) => [data, ...prevMessageList]);
        });
    }, []);


    let initialKey = 0;

    return(
        <div id="messageBox" ref={messageBox}>
            <div id="messages">
                {MessageList.map(data => 
                    <Message key={initialKey++} data={data} selfUser={selfUser}/>
                )}
            </div>
            <Input socket={socket} selfUser={selfUser}/>
        </div>
    )
};

export { MessageBox };