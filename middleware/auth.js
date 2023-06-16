const jwt = require("jsonwebtoken");

function auth(req, res ,next){
    try{
    let token = req.header("Authorization");
        if (!token) return res.status(402).send("Token Not Provided");
        jwt.verify(token, process.env.auth_key,function(err,data){
            if(err){
                return res.status(402).send("Unathorize Access")
            }else{
                next();
            }  
        });
    }catch(e){
        console.log(e.message)
        return res.status(500).send(e.message);
    }   
}
module.exports = auth