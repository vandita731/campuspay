const express = require("express")
const { authMiddleware } = require("./middleware/auth.middleware")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const walletRoutes = require("./routes/wallet.routes")
const transactionRoutes= require("./routes/transaction.routes")
const budgetRoutes=require("./routes/budget.routes")
const insightRoutes=require("./routes/insight.routes")
require("dotenv").config()

const authRoutes = require("./routes/auth.routes")

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/auth", authRoutes)
app.use("/api/wallet",walletRoutes)
app.use("/api/transactions",transactionRoutes)
app.use("/api/budget",budgetRoutes)
app.use("/api/insight",insightRoutes)


module.exports = app