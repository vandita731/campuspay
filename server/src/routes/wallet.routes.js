const express = require("express")
const { getWallet, addMoney, withdraw } = require("../controllers/wallet.controller")
const { authMiddleware } = require("../middleware/auth.middleware")

const router = express.Router()

// All wallet routes need auth
router.get("/", authMiddleware, getWallet)
router.post("/add", authMiddleware, addMoney)
router.post("/withdraw", authMiddleware, withdraw)

module.exports = router