
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


router.post("/login", async (req, res)=>{
try{

  // console.log(req.body.email)
    let user = await userModel.findOne({email  : req.body.email});
    if(!user) return res.status(401).send("Invalid User Email");
    
    let isValid =await bcrypt.compare(req.body.password , user.password);
    if(!isValid) return  res.status(401).send("Invalid User Password");

    let payload = {
      id : user._id,
      name : user.name,
      email : user.email, 
      profileImage : user.profileImage,
      contactNumber : user.contactNumber,
      loggedIn : true
    }
    
    // here i have assign login user his detail and token with are embeded
    let token = jwt.sign(payload, process.env.auth_key);
    res.status(200).send({token : token ,payload : payload})
}catch(e){
    res.status(500).send("error " + e.message);
}

});

router.post("/signUp", async (req, res) => {
    try {
      let user = await userModel.findOne({ email: req.body.email });
      if(user){
          if (user.verified === true){
              return res.status(400).send("Email is already Exist");
          }else{ 
              const data = await userModel.deleteMany({email : req.body.email})
              console.log(data)
          }
      }
      user = new userModel();
      user.name = req.body.name;
      user.email = req.body.email;
      user.password = req.body.password;
      user.contactNumber = req.body.contactNumber;
      await user.generateHashedPassword();
      let result = await user.save();

      const response = await sendVerificationEmail(result._id,result.name, result.email)
      if(response) res.status(200).send({id : result._id})

    } catch (err) {
      res.status(500).send("error " + err.message);
    }
  });

//send email from origional Account
router.post("/verifyEmail",async(req,res)=>{
  try{
    const {id , otp} = req.body
    console.log(id)
    if(!id || !otp) return res.status(400).send("OPT is Required")

    const userotpRecord = await  userOtpModel.find({userId : id});
    console.log(userotpRecord)
    if(userotpRecord.length <= 0 ) return res.status(400).send("Account record doesn't exist or has been verfied already. Please Sign in or login ")
    
    const {expiresAt ,hashedotp} = userotpRecord[0];

    if(expiresAt < Date.now()){
      //OTP Expire 
     await userOtpModel.deleteMany({userId  : id}) 
     res.status(400).send("OTP is Expired")
    }else{
      const validOtp = await bcrypt.compare(otp, hashedotp );
      if(!validOtp) return res.status(400).send("OTP is Invalid");
      await userModel.updateOne({_id  : id },{
        verified : true
      });
      await userOtpModel.deleteMany({userId : id});
      res.status(200).send("Email Verified")
    }
  }catch(err){
    res.status(500).send(err.message);
  }  
})


// send verification Email Again 
router.post("/resendVerifyEmail",async(req,res)=>{
  try{
    const { id } = req.body
    if(!id ) return res.status(400).send("User Id is Required")
     const data = await userOtpModel.deleteMany({userId  : id})
     const user = await userModel.findById({_id : id})
     console.log(user);
     if(!user) res.status(400).send("Does not find") 
     const response = await sendVerificationEmail(user._id,user.name,user.email);
     res.status(200).send("OPT Sent")
  }catch(err){
    res.status(500).send(err.message);
  }  
  
})

router.post('/forgetPasswordEmail',async(req,res)=>{
  try{
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if(!user) return res.status(400).send("User Does Not Exist")
    // delete existing token if exists
    await resetTokenModel.deleteMany({userId : user._id });
    const response = await sendResetPasswordEmail(user._id, email)
    res.status(200).send(response)

  }catch(err){
    res.status(500).send(err.message)
  }
})


router.post("/ResendforgetPasswordEmail",async(req,res)=>{
  try{
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if(!user) res.status(400).send("User Does Not Exist")
    // delete existing token if exists
    await resetTokenModel.deleteMany({userId : user._id });
    const response = await sendResetPasswordEmail(user._id, email)
    res.status(200).send(response)
  }catch(err){
    res.status(500).send(err.message)
  }
})


router.post("/updatePassword",async(req,res)=>{
  try{    
    const {token , email , password  } = req.body;
    if(!token || !email) return res.status(400).send("ResetToken/Email is Required")
    const user = await userModel.findOne({ email });
    if(!user) res.status(400).send("User Does Not Exits")
    const  reseTtoken = await resetTokenModel.find({userId : user._id});

    if(reseTtoken.length <= 0 ) return res.status(400).send("Reset Token Does Not Exist")
    const {expiresAt ,hashedresetToken} = reseTtoken[0];

    if(expiresAt < Date.now()){
      //OTP Expire 
     await resetTokenModel.deleteMany({userId  : id}) 
     res.status(400).send("Reset Token is Expired")
    }else{
      const validtoken = await bcrypt.compare(token , hashedresetToken )
      if(!validtoken) return res.status(400).send("Invalid Token");
      
      let salt = await bcrypt.genSalt(10);
      let hash = await bcrypt.hash(password, salt);

      await userModel.updateOne({_id  : user._id }, { "$set": { password: hash }} , { new: true });
      await resetTokenModel.deleteMany({userId : user._id});
      res.status(200).send("Password updated")
    }
  }catch(err){
    res.status(500).send(err.message);
  }  
})

router.post("/uploadProfileImage",async(req,res)=>{

  const { image, id } = req.body;
  try {
    const user = await userModel.findOneAndUpdate({ _id: id }, {
      "$set": {
        "profileImage": image
      }
    },{ returnDocument: 'after' })
    res.status(200).send(user.profileImage)

  } catch(error) {
    res.status(500).send(error.message)
  }
});
  
  router.post("/updateProfileDetail",async(req,res)=>{
  const { name, id , contactNumber } = req.body;
  try {
    const user = await userModel.findOneAndUpdate({ _id: id }, {
      "$set": {
        "name": name , "contactNumber" : contactNumber || null
      }
    },{ returnDocument: 'after' })
    res.status(200).send({"name" : user.name , "contactNumber" : user.contactNumber})

  } catch(error) {
    console.log(error)
    res.status(500).send(error.message)
  }

})







module.exports = router;
