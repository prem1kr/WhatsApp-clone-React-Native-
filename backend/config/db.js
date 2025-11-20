import mongoose from "mongoose";

const connectDB = async() => {
   try{
     await mongoose.connect(process.env.MONGO_URI);
     console.log("Database succcessfully connected");

   }catch(error){
     console.log("Error during database connection");
   }
}

export default connectDB;