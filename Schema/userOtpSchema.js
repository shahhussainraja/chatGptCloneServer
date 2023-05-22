const mongoose = require("mongoose")


const userVerificationSchema  = mongoose.Schema({
    userId  : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    hashedotp :{
        type :String
    },
    createdAt : {
        type  : Date 
    },
    expiresAt : { 
        type   : Date
    }
    
});
module.exports  = mongoose.model("userOTPVerification", userVerificationSchema);