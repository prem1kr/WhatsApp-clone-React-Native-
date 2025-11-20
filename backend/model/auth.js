import mongoose from "mongoose";

const authSchema = new mongoose.Schema({
  name: { type: String, required: true },      
  email: { type: String, required: true },      
  password: { type: String, required: true },
   avatar: { type: String, default: "" }, 
});

const authModel = mongoose.model("auth", authSchema);
export default authModel;
