import { useRef, useEffect, useState } from "react";

const User = ({ user, id }) => {
    const pic = useRef(null);
    const canvas = useRef(null), ctx = useRef(null);

    useEffect(() => {
        canvas.current = pic.current;
        ctx.current = canvas.current.getContext('2d');

        let displayImage = user.displayPic;
        let destinationImage = new Image();
        destinationImage.src = displayImage;

        destinationImage.onload = function () {
            ctx.current.drawImage(destinationImage, 0, 0, destinationImage.width, destinationImage.height, 0, 0, canvas.current.width, canvas.current.height);
        };
    }, []);

    const usernameStyle = {
        margin: "0px 20px",
        fontFamily: "Sofia",
        fontSize: "20px",
    }

    const dpStyle = {
        margin: "10px",
        cursor: "default",
    }

    const userHolderStyle = {
        backgroundColor: id === user.userID ? "#F87474": "white"
    }

    return(
        <div className="userHolder" style={userHolderStyle}>
            <canvas width={40} height={40} className="pic" style={dpStyle} ref={pic}/>
            <div style={usernameStyle}>{user.username}</div>
        </div>
    )
}

const Users = ({ socket }) => {
    const [userList, updateUsers] = useState({});

    useEffect(() => {
        socket.on("UserListUpdate", (users) => {
            updateUsers(users);
        });
    }, []);

    const users = []
    for(const user in userList){
        users.push(<User user={userList[user]} key={users.length} id={socket.id}/>);
    }

    return(
        <div id="userListHolder">
            {users}
        </div>
    )
}

export { Users };

