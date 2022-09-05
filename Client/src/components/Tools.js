import { useRef, useEffect, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Icon from '@fortawesome/free-solid-svg-icons'

const Button = (props) => {
    return(
        <button onClick={props.func} className={props.className}><FontAwesomeIcon icon={props.icon}/></button>
    )
}

const Color = (props) => {
    return(
        <button onClick={props.onClick} className={props.className} style={{backgroundColor: props.bgCol}} />
    )
}

const CursorSize = (props) => {
    const cursorSizeStyle = {
        width: 2*props.size+"px",
        height: 2*props.size+"px",
    }
    return(
        <div onClick={props.onClick} className={props.className} style={cursorSizeStyle}/>
    )
}

const ColorSelector = (props) => {
    const colorSelctor = useRef(null);
    const canvasWidth = 76;
    const canvasHeight = 76;

    const canvas = useRef(null), ctx = useRef(null);
    let changingCol = false;

    let changingColor = "rgb(255,255,255)"
    let prevX = 75, prevY = 75

    const getPixelColor = (x, y) => {
        let temp = [255, 255, 255]
        if(x >= 0 && x < canvasHeight && y >= 0 && y < canvasHeight)
            temp = ctx.current.getImageData(x, y, 1, 1).data;
        return "rgb("+temp[0]+","+temp[1]+","+temp[2]+")";
    }

    const changeCol = (e) => {
        let w = 4;
        let v = window.event;
        let cRect = canvas.current.getBoundingClientRect();
        if(v.touches){
            v = v.touches[0];
        }
        let x = Math.round((v.clientX - cRect.left - (w))/w)*w;
        let y = Math.round((v.clientY - cRect.top - (w))/w)*w;

        ctx.current.fillStyle = changingColor;
        ctx.current.fillRect(prevX, prevY, 4, 4);
        prevX = x
        prevY = y

        let color = getPixelColor(x, y);
        changingColor = color;
        document.getElementsByClassName("colorButton")[6].style.backgroundColor = color;

        props.mouseColorHandler(changingColor);
        toggleButton(6, "colorButton");
        
        ctx.current.fillStyle = "rgba(50,50,50,0.6)";
        ctx.current.fillRect(x, y, 4, 4);
    }

    const toggleButton = (index, className) => {
        // console.log(index, className)
        let buttons = document.getElementsByClassName(className);
        for(let i=0; i<buttons.length; i++){
            if(buttons[i].className === className+" on"){
                buttons[i].className = className;
            }
        }
        buttons[index].className = className+" on";
    }

    useEffect(() => {
        canvas.current = colorSelctor.current;
        ctx.current = canvas.current.getContext('2d');

        for(let i=0; i<canvasHeight; i+=4){
            for(let j=0; j<canvasWidth; j+=4){
                let r = (i / canvasWidth) * 255;
                let g = (j / canvasHeight) * 255;
                let b = 0.5 * 255;
                ctx.current.fillStyle = "rgb("+r+","+g+","+b+")";
                ctx.current.fillRect(i, j, 4, 4);
            }
        }
    }, [])

    return(
        <div>
            <div id="colorPicker">
                <Button func={() => {
                    props.drawHandler();
                    toggleButton(0, "toolsButtons");
                }} icon={Icon.faPaintBrush} className="toolsButtons on"/>
                <Button func={() => {
                    props.eraseHandler();
                    toggleButton(1, "toolsButtons");
                }} icon={Icon.faEraser} className="toolsButtons"/>
                <Button func={() => {
                    props.fillHandler();
                    toggleButton(2, "toolsButtons");
                }} icon={Icon.faFill} className="toolsButtons"/>
                <Button func={() => {
                    props.clearHandler();
                    props.eventHandler();
                }} icon={Icon.faTrash} className="toolsButtons"/>
                <Color className="colorButton on" bgCol="rgb(250,84,87)"
                onClick={() => {
                    props.mouseColorHandler("rgb(250,84,87)");
                    toggleButton(0, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(250,137,37)"
                onClick={() => {
                    props.mouseColorHandler("rgb(250,137,37)");
                    toggleButton(1, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(246,213,31)"
                onClick={() => {
                    props.mouseColorHandler("rgb(246,213,31)");
                    toggleButton(2, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(95,165,90)"
                onClick={() => {
                    props.mouseColorHandler("rgb(95,165,90)");
                    toggleButton(3, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(1,180,188)"
                onClick={() => {
                    props.mouseColorHandler("rgb(1,180,188)");
                    toggleButton(4, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(0,255,255)"
                onClick={() => {
                    props.mouseColorHandler("rgb(0,255,255)");
                    toggleButton(5, "colorButton");
                }}/>
                <Color className="colorButton" bgCol="rgb(255,255,255)"
                onClick={() => {
                    props.mouseColorHandler(changingColor);
                    toggleButton(6, "colorButton");
                }}/>
                <canvas id="colorSelector" 
                    ref={colorSelctor} 
                    width={canvasWidth} 
                    height={canvasHeight}
                    onMouseDown={() => {
                        changingCol = true;
                        changeCol();
                    }}
                    onMouseUp={() => {
                        changingCol = false;
                    }}
                    onMouseMove={() => {
                        if(changingCol) changeCol();
                    }}   
                    onTouchStart={() => {
                        changingCol = true;
                        changeCol();
                    }}
                    onTouchEnd={() => {
                        changingCol = false;
                    }}
                    onTouchMove={() => {
                        if(changingCol) changeCol();
                    }}   
                />
            </div>
            <CursorSize onClick={() => {
                props.mouseCursorSizeHandler(2);
                toggleButton(0, "cursorSizeStyle");
            }} size={2} className="cursorSizeStyle"/>
            <CursorSize onClick={() => {
                props.mouseCursorSizeHandler(4);
                toggleButton(1, "cursorSizeStyle");
            }} size={4} className="cursorSizeStyle"/>
            <CursorSize onClick={() => {
                props.mouseCursorSizeHandler(8);
                toggleButton(2, "cursorSizeStyle");
            }} size={8} className="cursorSizeStyle on"/>
            <CursorSize onClick={() => {
                props.mouseCursorSizeHandler(16);
                toggleButton(3, "cursorSizeStyle");
            }} size={16} className="cursorSizeStyle"/>
        </div>
    )
}

export { ColorSelector };