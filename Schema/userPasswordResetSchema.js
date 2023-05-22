const mongoose = require("mongoose")


const userPasswordResetSchema  = mongoose.Schema({
    userId  : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    hashedresetToken :{
        type :String
    },
    createdAt : {
        type  : Date,
        default :  Date.now()
    },
    expiresAt : { 
        type   : Date,
        default : Date.now() + 3600000
    }

});
module.exports  = mongoose.model("userPasswordResetToken", userPasswordResetSchema);