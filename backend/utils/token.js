import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET_KEY || "premkumar";

export default function generateToken(user) {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: "7d" }); 
}
