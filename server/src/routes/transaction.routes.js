const express = require("express")
const { getTransactions, getTransactionSummary } = require("../controllers/transaction.controller")
const { authMiddleware } = require("../middleware/auth.middleware")

const router = express.Router()

router.get("/", authMiddleware, getTransactions)
router.get("/summary", authMiddleware, getTransactionSummary)

module.exports = router