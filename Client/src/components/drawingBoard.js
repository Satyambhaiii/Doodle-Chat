import { useRef, useEffect, useState } from "react";
import Queue from "../dataStructures/Queue";
import { ColorSelector } from "./Tools.js";

const DrawingBoard = ({ socket, selfUser }) => {
    let canvasWidth = 800;
    let canvasHeight = 600;
    const myCanvas = useRef(null);
    const myCanvasOverlay = useRef(null);
    const canvas = useRef(null), ctx = useRef(null), overlayCanvas = useRef(null), overlayCtx = useRef(null);
    const drawingHolder = useRef(null);

    let toSendData = false;

    useEffect(() => {
        socket.on('Image', (data) => {
            let displayImage = data;
            let destinationImage = new Image();
            destinationImage.src = displayImage;
            destinationImage.onload = function () {
                ctx.current.drawImage(destinationImage, 0, 0);
            };
        })
        

        const interval = setInterval(() => {
            if(toSendData) {
                let currCanvasState = {
                    "image": canvas.current.toDataURL('image/jpeg', 1),
                    "roomID": selfUser.current.roomID,
                    "userID": selfUser.current.userID
                }
                socket.emit("Image", currCanvasState);
                toSendData = false;
            }
        }, 1000);

        return () => { 
            clearInterval(interval); 
            console.log("afterClearnup!"); 
        }
    }, []);

    useEffect(() => {
        overlayCanvas.current = myCanvasOverlay.current;
        overlayCtx.current = overlayCanvas.current.getContext('2d');
        canvas.current = myCanvas.current;
        ctx.current = canvas.current.getContext('2d');

        ctx.current.fillStyle = "rgb(255,255,255)";
        ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.current.imageSmoothingEnabled = false;
        overlayCtx.current.imageSmoothingEnabled = false;
    }, []);

    let globalColor = "rgb(250,84,87)";
    let toHandleEvent = false;

    let mouseObject = {
        prevEvent: "draw",
        event: "draw",
        color: "rgb(250,84,87)",
        cursorSize: 8,
        prevX: -1,
        prevY: -1,
        xPos: 0,
        yPos: 0
    }

    const drawHandler = () => {
        mouseObject.prevEvent = mouseObject.event;
        mouseObject.event = "draw";
        mouseObject.color = globalColor;
    }

    const eraseHandler = () => {
        mouseObject.prevEvent = mouseObject.event;
        mouseObject.event = "erase";
        mouseObject.color = "rgb(255,255,255)";
    }

    const clearHandler = () => {
        mouseObject.prevEvent = mouseObject.event;
        mouseObject.event = "clear";
        mouseObject.color = globalColor;
    }

    const fillHandler = () => {
        mouseObject.prevEvent = mouseObject.event;
        mouseObject.event = "fill";
        mouseObject.color = globalColor;
    }

    const fillPixel = (x, y) => {
        let w = mouseObject.cursorSize;
        ctx.current.fillStyle = mouseObject.color;
        ctx.current.fillRect(x , y , 2 * w, 2 * w);

    }

    const draw = () => {
        let x = mouseObject.x;
        let y = mouseObject.y;
        let w = 2 * mouseObject.cursorSize;
        let verDiff = (y - mouseObject.prevY) / w;
        let horDiff = (x - mouseObject.prevX) / w;
        
        let verDir = verDiff >= 0 ? 1 : -1;
        let horDir = horDiff >= 0 ? 1 : -1;

        verDiff = Math.abs(verDiff);
        horDiff = Math.abs(horDiff);

        let verMul = 1;
        let horMul = 1;

        if(verDiff >= horDiff && (horDiff !== 0)){
            horMul = Math.max(1, Math.floor(verDiff / horDiff));
        }
        else if(verDiff !== 0){
            verMul = Math.max(1, Math.floor(horDiff / verDiff));
        }
        
        while((mouseObject.prevX !== x) || (mouseObject.prevY !== y)){
            let tempHorMul = horMul, tempVerMul = verMul;

            while(mouseObject.prevX !== x && tempHorMul > 0){
                mouseObject.prevX += w * horDir;
                fillPixel(mouseObject.prevX, mouseObject.prevY);
                tempHorMul--;
            }

            while(mouseObject.prevY !== y && tempVerMul > 0){
                mouseObject.prevY += w * verDir;
                fillPixel(mouseObject.prevX, mouseObject.prevY);
                tempVerMul--;
            }
        }
        
        // let hold = mouseObject.color;
        // mouseObject.color = "black";
        fillPixel(x, y);
        // mouseObject.color = hold;

        mouseObject.prevX = x;
        mouseObject.prevY = y;
    }

    const getPixelColor = (x, y) => {
        let temp = ctx.current.getImageData(x, y, 1, 1);
        return "rgb(" + temp.data[0] + "," + temp.data[1] + "," + temp.data[2] + ")";
    }

    const floodFill = () => {
        let w = 2;
        let canvasX = mouseObject.x;
        let canvasY = mouseObject.y;

        let curr = getPixelColor(canvasX, canvasY);

        if (curr === mouseObject.color) return;

        let queue = new Queue();
        queue.enqueue([canvasX, canvasY]);

        ctx.current.fillStyle = mouseObject.color;

        while (!queue.isEmpty) {
            const top = queue.peek();
            queue.dequeue();

            if (top[0] <= 0 || top[0] >= canvas.current.width) continue;
            if (top[1] <= 0 || top[1] >= canvas.current.height) continue;
            if (getPixelColor(top[0], top[1]) !== curr) continue;

            ctx.current.fillRect(top[0] , top[1] , 2 * w, 2 * w);

            queue.enqueue([top[0] + 2 * w, top[1]]);
            queue.enqueue([top[0] - 2 * w, top[1]]);
            queue.enqueue([top[0], top[1] + 2 * w]);
            queue.enqueue([top[0], top[1] - 2 * w]);
        }
    }

    const mousePositionHandler = () => {
        let w = 2 * mouseObject.cursorSize;
        let v = window.event;
        let cRect = canvas.current.getBoundingClientRect();
        if(v.touches){
            v = v.touches[0];
        }

        let x = Math.round((v.clientX - cRect.left - mouseObject.cursorSize) / w) * w;
        let y = Math.round((v.clientY - cRect.top - mouseObject.cursorSize) / w) * w;

        if(mouseObject.prevX === -1){
            mouseObject.prevX = x;
            mouseObject.prevY = y;
        }

        mouseObject.x = x;
        mouseObject.y = y;
    }

    const mouseColorHandler = (color) => {
        globalColor = color;
        if(mouseObject.event !== "erase")
            mouseObject.color = globalColor;
    }

    const mouseCursorSizeHandler = (size) => {
        mouseObject.cursorSize = size;
    }

    const displayCursor = () => {
        let w = mouseObject.cursorSize;
        let x = mouseObject.x;
        let y = mouseObject.y;

        overlayCtx.current.clearRect(0, 0, overlayCanvas.current.width, overlayCanvas.current.height);

        overlayCtx.current.beginPath();
        overlayCtx.current.strokeStyle = "rgb(0,0,0)";
        overlayCtx.current.rect(x , y , 2 * w, 2 * w);
        overlayCtx.current.stroke();
    }

    const eventHandler = () => {
        mousePositionHandler();
        if (mouseObject.event === "draw" || mouseObject.event === "erase") {
            draw();
        }
        else if (mouseObject.event === "fill") {
            floodFill();
        }
        else if (mouseObject.event === "clear") {
            ctx.current.fillStyle = "rgb(255,255,255)";
            ctx.current.fillRect(0, 0, canvasWidth, canvasHeight);

            let prevEventHolder = mouseObject.prevEvent;
            mouseObject.prevEvent = mouseObject.event;
            mouseObject.event = prevEventHolder;
        }

        toSendData = true;
    }

    const canvasHolderStyle = {
        width: `${canvasWidth - 50}px`,
        height: `${canvasHeight - 50}px`,
    }

    return (
        <div id="drawingHolder" ref={drawingHolder}>
            <div id="drawingOptions">
                <ColorSelector
                    mouseColorHandler={mouseColorHandler}
                    mouseCursorSizeHandler={mouseCursorSizeHandler}
                    drawHandler={drawHandler}
                    eraseHandler={eraseHandler}
                    fillHandler={fillHandler}
                    clearHandler={clearHandler}
                    eventHandler={eventHandler}
                />
            </div>
            <div className="canvasHolder" style={canvasHolderStyle}>
                <canvas id="myCanvas"
                    width={canvasWidth} height={canvasHeight}
                    ref={myCanvas}
                    onMouseDown={() => {
                        toHandleEvent = true;
                        mouseObject.prevX = -1;
                        mouseObject.prevY = -1;
                        eventHandler();
                    }}
                    onMouseUp={() => {
                        toHandleEvent = false;
                    }}
                    onMouseMove={(e) => {
                        mousePositionHandler();
                        if (toHandleEvent) eventHandler();
                        displayCursor();
                    }}
                    onTouchStart={() => {
                        toHandleEvent = true;
                        mouseObject.prevX = -1;
                        mouseObject.prevY = -1;
                        eventHandler();
                    }}
                    onTouchEnd={() => {
                        toHandleEvent = false;
                    }}
                    onTouchMove={(e) => {
                        if (toHandleEvent) eventHandler();
                        displayCursor();
                    }}
                />
                <canvas id="myCanvasOverlay"
                    ref={myCanvasOverlay}
                    width={canvasWidth} height={canvasHeight}
                />
            </div>
        </div>
    );
}

export { DrawingBoard };