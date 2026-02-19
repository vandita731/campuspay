const bcrypt = require("bcryptjs")
const { PrismaClient } = require("@prisma/client")
const { generateAccessToken, generateRefreshToken ,verifyToken } = require("../utils/token")

const prisma = new PrismaClient()

async function register(req, res) {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        const response = await prisma.user.findUnique({
            where: { email: email }
        })
        if (response) {
            return res.status(409).json({
                msg: "Already Have Account"
            })
        }
        const hash = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hash
            }
        })

        await prisma.wallet.create({
            data: { userId: user.id }
        })

        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)
        const expire = new Date();
        expire.setDate(expire.getDate() + 7)
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: expire
            }
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,  // JS cannot access this cookie
            secure: false,   // set to true in production (HTTPS only)
            sameSite: "lax", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        })
        return res.status(200).json({
            message: "account created successfully ",
            accessToken: accessToken,
            id: user.id,
            name: user.name,
            email: user.email
        })
    } catch (error) {
        console.error("Register error:", error)
        return res.status(500).json({
            message: "getting error in creating the user"
        })
    }
}

async function login(req, res) {
    try {
        const email = req.body.email
        const password = req.body.password;
        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user) {
            return res.status(404).json({
                message: "Account does not exit create one"
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({
                message: "wrong password try again"
            })
        }
        const accessToken = generateAccessToken(user.id)
        const refreshToken = generateRefreshToken(user.id)
        const expire = new Date();
        expire.setDate(expire.getDate() + 7);
        await prisma.refreshToken.deleteMany({
            where:{userId:user.id}
        })

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                 userId: user.id,
                expiresAt: expire
            }
        })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,  // JS cannot access this cookie
            secure: false,   // set to true in production (HTTPS only)
            sameSite: "lax", // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        })

        return res.status(200).json({
            message: "login successfully ",
            accessToken: accessToken,
            id: user.id,
            name: user.name,
            email: user.email
        })
    } catch (error) {
        console.error("Register error:", error)
        return res.status(500).json({
            message: "getting error in login the user"
        })

    }
}


async function refresh(req, res) {
  try {

    let token = req.cookies.refreshToken;
    if(!token){
        return res.status(401)
    }

    try{
        const decode = verifyToken(token , process.env.JWT_REFRESH_SECRET)
    } catch(error){
        return res.status(401).json({
            message:"something went wrong"
        })
    }

    const refresh = await prisma.refreshToken.findFirst({
        where:{token:token}
    })

    if(!refresh){
        return res.status(401)
    }

    if(refresh.expiresAt< new Date()){
        return res.status(401).json({ message: "Refresh token expired" })
    }

    const accessToken = generateAccessToken(refresh.userId)

    return res.status(200).json({
        accessToken:accessToken
    })
    
  } catch (error) {
    console.log(error);
    return res.status(500).json({
        message:"something went wrong"
    })
  }
}

async function logout(req,res){
    const token = req.cookies.refreshToken;
    await prisma.refreshToken.deleteMany({
        where:{token}
    })

    res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"});


    return res.status(200).json({
        message:"logout successfully"
    })
}



module.exports = { register, login ,refresh,logout}