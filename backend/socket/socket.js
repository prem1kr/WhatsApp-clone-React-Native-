import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import registerUserEvent from './userEvents.js';
import { registerChatEvents } from './chatEvent.js';

dotenv.config();

export function initializeSocket(server) {
  if (!process.env.SECRET_KEY) {
    throw new Error('SECRET_KEY not set in environment variables');
  }

 const io = new SocketIOServer(server, {
  cors: {
    origin: "*",             
    methods: ["GET", "POST"] 
  }
});


  // Middleware to authenticate socket connection
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] }, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }

      const userData = decoded.user || decoded;
      if (!userData) {
        return next(new Error("Authentication error: Invalid token payload"));
      }

      socket.data = userData;
      socket.data.userId = userData.id || userData._id; 
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}, username: ${socket.data.name || 'unknown'}`);

     registerChatEvents(io, socket, userId);
    registerUserEvent(io, socket, userId);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
