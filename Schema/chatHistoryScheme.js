const mongodb = require("mongoose")

const chatHistory  = new mongodb.Schema({
    userId :{
        type : String
    },
    history : [
        {
        user  : String ,
        asistant  : String
        }
    ]
})

historyModel = mongodb.model( "chatHistory" , chatHistory );

module.exports = historyModel