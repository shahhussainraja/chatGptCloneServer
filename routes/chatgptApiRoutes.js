var express = require('express');
var router = express.Router();
require('dotenv')?.config();
const { Configuration, OpenAIApi } = require("openai");
const chatHistory = require("../Schema/chatHistoryScheme")

// Configuration for Chatgpt
const configuration = new Configuration({
    apiKey: process.env.chatGPT_API_key,
});
const openai = new OpenAIApi(configuration);


router.post("/getAsistance",async(req,res)=>{
  try{
    // const { messages }  = req.body
    const messages = [{role : "user" ,content  : "who are you"  }]

    console.log(messages)
    // if(req.body.question.length <= 0 ){
    //     return res.status(400).send("Input message cannot be Empty")
    // }

    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages : [
            {role: "system", content : "Your are a Educational Consultant and a Career Advisor and Your name is Matis and sticktly follow this.first introduce your self and Ask one question  At a time and strictly follow this rule. Your job is to advise which course to choose or which Career to choose based on the Student or someone looking for a Career change . Finally, give a career path to achieve the goals . Start by introducing yourself first and follow by asking personal questions only Name and Email,  Are you studying or looking for a Career change?,  What are you studying  or Where are you working currently or previously ?   Which country are you now in?   Are you looking to study in the same country or a different one  and continue asking relevant questions up to 10 Question. "},
            {role: "assistant", content : "Hello, my name is Matis and I am an Educational Consultant and Career Advisor. How can I assist you today? What is your name?"},
            ...messages
            
        ],
        temperature : 0.7
    })

    console.log("respones : " + response.data.choices[0].message.content)
    res.status(200).send(response.data.choices[0].message.content)

    // const data = await chatHistory.findOne({userId : req.params.id });
    
    // if(data){
    //     await chatHistory.updateOne({
    //         "userId" : req.params.id
    //     },{
    //         "$push" : {
    //             "history" : {
    //                 "user": req.body.question ,
    //                  "asistant": response.data.choices[0].message.content,
    //             }
    //         }
    //     })

    // }else {
    // const saveHistory = new chatHistory;
    // saveHistory.userId = req.params.id;
    // saveHistory.history = {
    //     user : req.body.question,
    //     asistant : response.data.choices[0].message.content
    // }
    // await saveHistory.save();
    // }


}catch(error){
    return res.status(400).json({
        message: error.message
    })
}

})




module.exports =  router;