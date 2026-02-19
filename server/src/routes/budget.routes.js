const express = require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { setBudget, getBudgetStatus } = require("../controllers/budget.controller")

const router = express.Router()

router.post("/setBudget", authMiddleware,setBudget )
router.get("/getBudgetStatus", authMiddleware, getBudgetStatus)

module.exports = router