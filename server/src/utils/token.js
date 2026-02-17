const jwt = require("jsonwebtoken");

function generateAccessToken(userId){
    const accessToken = jwt.sign({userId:userId},process.env.JWT_ACCESS_SECRET,{expiresIn:"15m"})
    return accessToken;
}

function generateRefreshToken(userId){
    const refreshToken = jwt.sign({userId:userId},process.env.JWT_REFRESH_SECRET,{expiresIn:"7d"})
    return refreshToken;
}

function verifyToken(token,secret){
    let response = jwt.verify(token,secret)
    return response
}

module.exports={
    generateAccessToken,
    generateRefreshToken,
    verifyToken
}