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


router.post("/getAsistance/:id",async(req,res)=>{
  try{


    const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages : [{role: "user", content : req.body.question}]
    })

    console.log("respones : " + response.data.choices[0].message.content)
    res.status(200).send(response.data.choices[0].message)

    const data = await chatHistory.findOne({userId : req.params.id });
    if(data){
        await chatHistory.updateOne({
            "userId" : req.params.id
        },{
            "$push" : {
                "history" : {
                    "user": req.body.question ,
                     "asistant": response.data.choices[0].message.content,
                }
            }
        })

    }else {
    const saveHistory = new chatHistory;
    saveHistory.userId = req.params.id;
    saveHistory.history = {
        user : req.body.question,
        asistant : response.data.choices[0].message.content
    }
    await saveHistory.save();
    }


}catch(e){
    res.status(400).send(e.message)
    console.log(e.message + "error")
}

})



module.exports =  router;