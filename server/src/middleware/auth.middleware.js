const { verifyToken } = require("../utils/token")
require("dotenv").config()

async function authMiddleware(req,res,next){
    try{
        const authHeader = req.headers.authorization
const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message:"access not granted"
        })
    }
    let decode;
    try{
        decode = verifyToken(token,process.env.JWT_ACCESS_SECRET);
    } catch(error){
        console.log(error);
        return res.status(401).json({
            message:"invalid user"
        })
    }

    req.user=decode.userId;
    next();
    } catch(error){
        return res.status(500).json({
            message :"something went wrong"
        })
    }
}

module.exports={authMiddleware}