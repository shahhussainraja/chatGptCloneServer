const jwt = require("jsonwebtoken");

function auth(req, res ,next){

    let token = req.header("Authorization");
    if (!token) return res.status(401).send("Token Not Provided");

    try{
        let user = jwt.verify(token, process.env.auth_key);
        if(!user) return res.status(401).send("Unathorize Access")
    }catch(e){
        return res.status(500).send(e.message);
    }
    
    next();
}

module.exports = auth