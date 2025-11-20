import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRouter from './routes/authRoute.js';
import cors from 'cors';
import { initializeSocket } from './socket/socket.js';
import http from 'http';

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 5000; 


app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// listen to socket
const server = http.createServer(app);
initializeSocket(server);

app.use('/api', authRouter);

server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
  connectDB();
});
