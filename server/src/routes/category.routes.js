const express = require("express")
const { authMiddleware } = require("../middleware/auth.middleware")
const { createCategory, getCategories } = require("../controllers/category.controller")

const router = express.Router()

router.get("/", authMiddleware,getCategories )
router.post("/", authMiddleware,createCategory )


module.exports = router