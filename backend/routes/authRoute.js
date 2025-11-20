import express from 'express';
import { getUserById, Login, Register, updateUser } from '../controllers/auth.js';
const authRouter = express.Router();

authRouter.post('/auth/register', Register);
authRouter.post('/auth/login', Login);
authRouter.get('/auth/user/:id', getUserById);
authRouter.put('/auth/user/:id', updateUser);

export default authRouter;