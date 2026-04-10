import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIResponse from "../utils/openai.js";

const router = express.Router();

//test
router.post("/test" , async(req ,res)=>{
    try{
        const thread = new Thread({
        threadId : "abz",
        title : "working of project"
        });

        const response = await thread.save();
        res.send(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error : "Failed to save in DB"});
    }
    
});

//Get all threads
router.get("/thread" , async(req , res)=>{
    try{
        const threads = await Thread.find({}).sort({updatedAt : -1});
        //descending order of updatedAt...Most recent data on top
        res.send(threads);
    }catch(err) {
        console.log(err);
        res.status(500).json({error : "Failed to fetch threads"})
    }
});

//Get sepecific Thread
router.get("/thread/:threadId" , async(req , res)=>{
    try{
        const {threadId} = req.params;
        const thread = await Thread.findOne({threadId});
        if(!thread){
            res.status(404).json({error : "Thread Not Found"});
        }
        res.json(thread.messages);
    }catch(err) {
        console.log(err);
        res.status(500).json({error : "Failed to fetch threads"})
    }
});

//Delete sepecific thread
router.delete("/thread/:threadId" , async(req , res)=>{
    try{
        const {threadId} = req.params;
        const thread = await Thread.findOneAndDelete({threadId});
        if(!thread){
            res.status(404).json({error : "Thread could not be Deleted"});
        }
        res.status(200).json({success : "Thread successfully Deleted"});
    }catch(err) {
        console.log(err);
        res.status(500).json({error : "Failed to fetch threads"})
    }
});

router.post("/chat" , async(req,res)=>{
    const {threadId , message} = req.body;

    if(!threadId || !message){
        res.status(404).json({error : "missing required fields"});
    }

    try{
        let thread = await Thread.findOne({threadId});

        if(!thread){
            //create a new thread in DB
            thread = new Thread({
                threadId,
                title : message,
                messages : [{role : "user" , content : message}]
            });
        }else{
            thread.messages.push({role : "user" , content : message});
        }

        const assistantReply = await getOpenAIResponse(message);

        thread.messages.push({role : "assistant" , content : assistantReply});
        thread.updatedAt = new Date();
        await thread.save();
        
        res.json({reply : assistantReply});
    }catch(err) {
        console.log(err);
        res.status(500).json({error : "Something went wrong"});
    }
})

export default router;