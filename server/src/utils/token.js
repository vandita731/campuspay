const jwt = require("jsonwebtoken");

function generateAccessToken(user){
    const accessToken = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    )
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