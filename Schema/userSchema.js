const mongodb = require("mongoose")
const bcrypt  =require("bcryptjs")

const user = new mongodb.Schema({
    name : {
        type : String,
        required : true
    },
    email :{
        type  : String,
        requried : true  

    },
    password :{
        type : String,
        required : true 
    },
    contactNumber :{
        type : Number,
    },
    profileImage :{
        type : String,
    },
    verified : {
        type: Boolean,
        default  : false
    }
    
},{timestamps: true});

user.methods.generateHashedPassword = async function () {
    try {
      //encryption of password
      let salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      res.send("error " + err.message);
    }
  
  };

module.exports = mongodb.model("user",user);


