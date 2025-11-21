import { io } from 'socket.io-client';

const SOCKET_URL = 'https://whatsapp-clone-oidq.onrender.com';
const socket = io(SOCKET_URL, {
  autoConnect: true,
});

export default socket;
