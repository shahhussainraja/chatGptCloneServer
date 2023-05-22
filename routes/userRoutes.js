
const express = require("express")
let router = express.Router();
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require('dotenv')?.config();
const sendVerificationEmail = require("../utils/EmailVerification")
const userOtpModel = require("../Schema/userOtpSchema");
const userModel = require("../Schema/userSchema");
const resetTokenModel = require("../Schema/userPasswordResetSchema");
const sendResetPasswordEmail = require("../utils/ResetpassworkEmail");


router.post("/login",async(req,res)=>{
try{

  // console.log(req.body.email)
    let user = await userModel.findOne({email  : req.body.email});
    if(!user) return res.status(401).send("Invalid User Email");
    
    let isValid =await bcrypt.compare(req.body.password , user.password);
    if(!isValid) return  res.status(400).send("Invalid User Password");

    // here i have assign login user his detail and token with are embeded
    let token = jwt.sign({ user : user}, process.env.auth_key);
    res.send(token);


}catch(e){
    res.status(400).send("error " + e.message);
}

});

router.post("/signUp", async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.body.email });
      if (user)
        return res.status(400).send("Email is already Exist failed to register");
      user = new userModel();
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      await user.generateHashedPassword();
      let result = await user.save();

      const response = await sendVerificationEmail(result._id,result.name, result.email)
      if(response) res.status(200).send(response)

    } catch (err) {
      res.status(400).send("error " + err.message);
    }
  });

//send email from origional Account
router.post("/verifyEmail",async(req,res)=>{
  try{
    const {id ,opt} = req.body
    if(!id || !opt) return res.status(400).send("OPT is Required")

    const userotpRecord = await  userOtpModel.find({userId : id});
    console.log(userotpRecord)
    if(userotpRecord.length <= 0 ) return res.status(400).send("Account record doesn't exist or has been verfied already. Please Sign in or login ")
    
    const {expiresAt ,hashedotp} = userotpRecord[0];

    if(expiresAt < Date.now()){
      //OTP Expire 
     await userOtpModel.deleteMany({userId  : id}) 
     res.status(400).send("OTP is Expired")
    }else{
      const validOpt = await bcrypt.compare(opt , hashedotp )
      if(!validOpt) return res.status(400).send("OPT is Invalid");
      await userModel.updateOne({_id  : id },{
        verified : true
      });
      await userOtpModel.deleteMany({userId : id});
      res.status(200).send("Email Verified")
    }
  }catch(err){
    res.status(400).send(err.message);
  }  
})


// send verification Email Again 
router.post("/resendVerifyEmail",async(req,res)=>{
  try{
    const {id , email , name} = req.body
    if(!id || !email || ! name ) return res.status(400).send("Id/Email/Name is Required")
     await userOtpModel.deleteMany({userId  : id}) 
     const response = await sendVerificationEmail(id,name,email);
     res.status(200).send(response)
  }catch(err){
    res.status(400).send(err.message);
  }  
  
})

router.post('/forgetPasswordEmail',async(req,res)=>{
  try{
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    console.log(user)
    if(!user) res.status(400).send("User Does Not exits")
    // delete existing token if exists
    await resetTokenModel.deleteMany({userId : user._id });
    const response = await sendResetPasswordEmail(user._id, email)
    res.status(200).send(response)

  }catch(err){
    res.status(400).send(err.message)
  }
})


router.post("/ResendforgetPasswordEmail",async(req,res)=>{
  try{
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if(!user) res.status(400).send("User Does Not exits")
    // delete existing token if exists
    await resetTokenModel.deleteMany({userId : user._id });
    const response = await sendResetPasswordEmail(user._id, email)
    res.status(200).send(response)
  }catch(err){
    res.status(400).send(err.message)
  }
})


router.post("/updatePassword",async(req,res)=>{
  try{    
    const {resetToken , email , password  } = req.body;
    if(!resetToken || !email) return res.status(400).send("ResetToken/Email is Required")
    const user = await userModel.findOne({ email });
    if(!user) res.status(400).send("User Does Not exits")
    const  token = await resetTokenModel.find({userId : user._id});

    if(token.length <= 0 ) return res.status(400).send("Reset Token Does Not Exist")
    const {expiresAt ,hashedresetToken} = token[0];

    if(expiresAt < Date.now()){
      //OTP Expire 
     await resetTokenModel.deleteMany({userId  : id}) 
     res.status(400).send("Reset Token is Expired")
    }else{
      const validtoken = await bcrypt.compare(resetToken , hashedresetToken )
      if(!validtoken) return res.status(400).send("Invalid Token");
      
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);

      await userModel.updateOne({_id  : user._id }, { "$set": { password: hash }} , { new: true });
      await resetTokenModel.deleteMany({userId : user._id});
      res.status(200).send("Password updated")
    }
  }catch(err){
    res.status(400).send(err.message);
  }  
})





module.exports = router;
