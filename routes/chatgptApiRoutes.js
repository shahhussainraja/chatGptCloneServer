var express = require('express');
var router = express.Router();
require('dotenv')?.config();
const { Configuration, OpenAIApi } = require("openai");
const chatHistory = require("../Schema/chatHistoryScheme");
const auth = require('../middleware/auth');
var ObjectID = require('mongodb').ObjectID;

// Configuration for Chatgpt
const configuration = new Configuration({
    apiKey: process.env.chatGPT_API_key,
});
const openai = new OpenAIApi(configuration);


// for ChatGPT Chat Completion
router.post("/getAsistance",auth,async(req,res)=>{
  try{  
    console.log(req.body)
    const { messages }  = req.body
    console.log(req.query)

    // if array zero do not process it
    if(messages.length <= 0 ){
        return res.status(400).send("Input message cannot be Empty")
    }

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages : [
            {role: "system", content : "Your are a Educational Consultant and a Career Advisor and Your name is Matis also Please note that irrelevant prompts will not be entertained sticktly follow this.first introduce your self and Ask one question  At a time and strictly follow this rule. Your job is to advise which course to choose or which Career to choose based on the Student or someone looking for a Career change . Finally, give a career path to achieve the goals . Start by introducing yourself first and follow by asking personal questions only Name and Email,  Are you studying or looking for a Career change?,  What are you studying  or Where are you working currently or previously ?   Which country are you now in?   Are you looking to study in the same country or a different one  and continue asking relevant questions up to 10 Question."},
            {role: "assistant", content : "Hello, my name is Matis and I am an Educational Consultant and Career Advisor. How can I assist you today? What is your name?"},
            ...messages
            
        ],
        temperature : 0,
        top_p: 0.1,
        max_tokens : 100,
    })

    // Extracting msg for new message to store in database
    const userMessage =  messages[messages.length - 1] ;
    const AIresponse  = {role  :"assistant" ,content: response.data.choices[0].message.content}
    
    // check if message from existing chat
    if(req.query.chatId !== "newChat"){
        res.status(200).send({
            AIresponse,
            chatId : null
        })
        const result2 = await chatHistory.findOneAndUpdate({
            "_id" :  req.query.chatId
        },{     
            "$push" : {
                "history" : { 
                    "$each" :[messages[messages.length - 1] , AIresponse]
                }
            }
        })
        // console.log("while save Existing record"  ,result2)
    }else {
        const saveHistory = new chatHistory({
            userId :req.query.userId,
            chatTitle : userMessage.content,
            history : [
                messages[messages.length - 1],
                AIresponse
            ]
        });
        const result = await saveHistory.save();
        return res.status(200).send({
            AIresponse,
            chatId : result._id
        })
        // console.log("while save new record " , result)
        }

}catch(error){
    console.log(error)
    res.status(500).json(error.message)
}
})

// fetch all chat history of specific user
router.get("/getChatHistory/:id",auth, async(req,res)=>{
    try{
        console.log(req.params.id)
        const result = await chatHistory.find({ userId : req.params.id}).sort({createdAt : -1});
        res.status(200).send(result);
        // console.log(result)
    }catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
})

// fetch specific chat history message of user
router.get("/getChatHistoryMessage/:id",auth,async(req,res)=>{
    try{
        const result = await chatHistory.findOne({ _id : req.params.id},"history")
        res.status(200).send(result);
        // console.log(result)
    }catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
})

// delete specific chat
router.get("/deleteChatHistory/:id",auth,async(req,res)=>{
    try{
        const result = await chatHistory.findByIdAndRemove({ _id : req.params.id})
        res.status(200).send(result);
        // console.log(result)
    }catch(err){
        res.status(500).send(err.message)
        console.log(err.message)
    }
})

module.exports =  router;