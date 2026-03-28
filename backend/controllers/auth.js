import authModel from "../model/auth.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;


export const Register = async (req, res) => {
    const { name, email, password,  avatar } = req.body;

    try {
        const existingUser = await authModel.findOne({ email });
        if (existingUser) {
            console.log(`User already registered: ${email}`);
            return res.status(409).json({ message: "User already registered, please login" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await authModel.create({
            name,
            email,
            password: hashedPassword,
             avatar:  avatar || "", 
        });

        const token = jwt.sign({ user: { email: newUser.email, id: newUser._id, name: newUser.name } }, SECRET_KEY, { algorithm: 'HS256' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        console.log(`User created successfully: ${email}`);
        return res.status(201).json({ message: "User created successfully", user: newUser, token });

    } catch (error) {
        console.error("Error during signup process", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            {
                user: { id: user._id, email: user.email, name: user.fullName, role: user.role }
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,         
            sameSite: "None",      
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        return res.status(200).json({
            message: "Login successful",
            user: safeUser,
            token
        });

    } catch (error) {
        console.error("SignIn error:", error);
        return res.status(500).json({
            message: `SignIn error: ${error.message}`
        });
    }
};


export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await authModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      avatar: user.avatar || "",
    });

  } catch (error) {
    console.error("Error fetching user by id:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name,  avatar } = req.body;

    try {
        const user = await authModel.findByIdAndUpdate(
            id,
            { name,  avatar}, 
            
            { new: true }     
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ name: user.name, email: user.email });
    } catch (error) {
        console.error("Error updating user by id:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
