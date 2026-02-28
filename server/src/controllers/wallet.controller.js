const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const redis = require("../utils/redis")

async function getWallet(req, res) {
    try {
        const userId = req.user
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        })
        if (!wallet) {
            return res.status(404).json({
                message: "something qqent wrong"
            })
        }
        return res.status(200).json({
            wallet
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

async function addMoney(req, res) {
    try {
        const amount = req.body.amount;
        const note = req.body.note;
        if (amount <= 0) {
            return res.status(400).json({
                message: "enter the positive amount"
            })
        }

        const userId = req.user;
        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: amount } }
            })

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    note,
                    amount,
                    type: "CREDIT"
                }
            })
        })

        const now = new Date()
        const cacheKey = `summary:${userId}:${now.getFullYear()}-${now.getMonth() + 1}`
        await redis.del(cacheKey)
        return res.status(200).json({
            message: "money added successfully"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

async function withdraw(req, res) {
    try {
        const userId = req.user;
        const amount = req.body.amount;
        const note = req.body.note;
        const categoryId = req.body.categoryId;

        if (amount <= 0) {
            return res.status(400).json({
                message: "enter the positive amount"
            })
        }
        await prisma.$transaction(async (tx) => {
            const wallet = await tx.wallet.findUnique({
                where: { userId }
            })
            if (wallet.balance < amount) {
                throw new Error("Insufficient balance")
            }

            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amount } }
            })

            const category = await tx.category.findUnique({
                where: { id: categoryId }
            })

            if (!category) {
                throw new Error("Invalid category")
            }

            await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    note,
                    amount,
                    type: "DEBIT",
                    categoryId: category.id
                }
            })
        })

        const now = new Date()
        const cacheKey = `summary:${userId}:${now.getFullYear()}-${now.getMonth() + 1}`
        await redis.del(cacheKey)
        return res.status(200).json({
            message: "amount debited successfully"
        })
    } catch (error) {
        console.log(error)
        if (error.message === "Invalid category") {
            return res.status(400).json({ message: "Invalid category" })
        }
        if (error.message === "Insufficient balance") {
            return res.status(400).json({ message: "Insufficient balance" })
        }
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

module.exports = { getWallet, addMoney, withdraw }