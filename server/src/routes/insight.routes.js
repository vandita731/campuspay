const express = require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { getInsights } = require("../controllers/insight.controller")


const router = express.Router()

router.get("/getInsights", authMiddleware, getInsights)

module.exports = router