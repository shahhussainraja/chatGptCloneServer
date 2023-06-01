require('dotenv')?.config();
const nodemailer = require("nodemailer");
const mailGen  = require("mailgen") 
const bcrypt  =require("bcryptjs")
const userVerficationSchema = require("../Schema/userOtpSchema");

const sendOTPVerificationEmail = async(id ,name, emailAddress )=>{
    try{
        let opt = `${Math.floor(1000 + Math.random() * 9000)}` 
        console.log(opt)
        let config ={ 
            service : "gmail",
            auth  : {
              user  : process.env.Email,
              pass  : process.env.Password
            }
          }
          let transporter  = nodemailer.createTransport(config);
          let mailGenerator = new mailGen({
            theme : "salted",
            // Appears in header & footer of e-mails
            product :{
              name: 'brainStack.io',
              link: 'https://brain-stack'
              // Optional product logo
              // logo: 'https://mailgen.js/img/logo.png'
            }
          })

          var emailData = {
            body: {
                name: `${name}`,
                intro: ['Welcome to BrainStack! We\'re very excited to have you on board.',`Your OTP Code is ${opt}`],
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
          };
          
          let email = mailGenerator.generate(emailData); 
          let message = {
            from: process.env.Email, // sender address
            to: emailAddress, // list of receivers
            subject: "Verify Email", // Subject line
            html: email, // html body
          }
          
          //hased opt 
          let salt = await bcrypt.genSalt(10);
          hasdedOTP = await bcrypt.hash(opt, salt);

          const newVerificationOTP = await new userVerficationSchema({
            userId : id,
            hashedotp  : hasdedOTP,
            createdAt  : Date.now(),
            expiresAt : Date.now() + 3600000
          })
          await  newVerificationOTP.save()
        
          const result = await transporter.sendMail(message).then((info)=>{
            return {
                msg : "Verification OTP Email Send", 
                data : {
                    id : id,
                    email : emailAddress,
                    name : name 
                }
            }
          })
          return result;
    }catch(err){
         return err
    }
}

module.exports =  sendOTPVerificationEmail