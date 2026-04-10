import express from "express"
import "dotenv/config"
import cors from "cors"
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js"

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api" , chatRoutes);

app.listen(8080 , ()=>{
    console.log("Server is running on 8080");
    connectDB();
});

const connectDB = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected with DB");
    }
    catch(err){
        console.log("Failed to connect with DB " , err);
    }
}