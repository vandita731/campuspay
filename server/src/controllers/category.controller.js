// category.controller.js
const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()
async function getCategories(req, res) {
    try {
        const userId = req.user
        const categorys = await prisma.category.findMany({
            where: {
                OR: [{ userId: null }, { userId }]
            }
        })
        return res.status(200).json({
            categorys
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "something went wrong "
        })
    }
}

async function createCategory(req, res) {
    const userId = req.user
    const { name, icon } = req.body
    if (!name) {
        return res.status(400).json({ message: "Category name is required" })
    }
    try {
        const newCategory = await prisma.category.create({
            data: {
                name, icon, userId
            }
        })
        return res.status(200).json({
            newCategory,
            message: "new category created successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "something went wrong "
        })
    }
    // create with userId
}

module.exports = { getCategories, createCategory }