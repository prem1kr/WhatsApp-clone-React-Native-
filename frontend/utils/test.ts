// test-getMessages.ts
import { io, Socket } from "socket.io-client";

const socket: Socket = io("https://192.168.1.3:5000");

socket.on("connect", () => {
  console.log("Connected to socket server");

  // Send getMessages event
  socket.emit("getMessages", { conversationId: "690880c24cf091f2cde16d3c" });

  // Listen for getMessages response
  socket.on("getMessages", (data: any) => {
    console.log("getMessages response:", data);
    socket.disconnect();
  });
});
