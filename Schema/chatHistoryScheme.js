const mongodb = require("mongoose")

const chatHistory  = new mongodb.Schema({
    userId :{
        type : mongodb.Schema.Types.ObjectId,
        ref : "user"
    },
    chatTitle : {
        type : String,
    },
    history : [
        {
        user  : String ,
        asistant  : String
        }
    ]
})
module.exports = mongodb.model( "chatHistory" , chatHistory );