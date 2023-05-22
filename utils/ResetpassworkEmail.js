require('dotenv')?.config();
const nodemailer = require("nodemailer");
const mailGen  = require("mailgen") 
const bcrypt  =require("bcryptjs")
const userResetPasswordSchema = require("../Schema/userPasswordResetSchema");
var randomstring = require("randomstring");

const sendResetPasswordEmail = async(id , emailAddress )=>{
    try{
        let token = randomstring.generate();
        console.log(token)
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
              name: `dear user`,
              intro: ['You have Received this email because a reset password request \n received form your BrainStack account',`${token}`],
              action: [
                {
                  instructions: 'Click the button below to reset your password',
                  button: {
                    color: '#22BC66',
                    text: 'Reset your passwork',
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                  }
                },
              ],
              outro: 'If you did not request a password reset, no further action is required \n on your part.'
            }
          };
          //hased Token 
          let salt = await bcrypt.genSalt(10);
          hasdedToken = await bcrypt.hash(token , salt);

          const newResetToken = await new userResetPasswordSchema({
            userId : id,
            hashedresetToken  : hasdedToken,
          })
          await newResetToken.save()
          
          let email = mailGenerator.generate(emailData); 
          let message = {
            from: process.env.Email, // sender address
            to: emailAddress, // list of receivers
            subject: "Reset password", // Subject line
            html: email, // html body
          }
        
          const result = await transporter.sendMail(message).then((info)=>{
            return {
                msg : "Reset Password Email Send", 
                data : {
                    id : id,
                    email : emailAddress,
                }
            }
          })
          return result;
    }catch(err){
          console.log(err.message)
          return err
    }
}
module.exports =  sendResetPasswordEmail