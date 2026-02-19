const { PrismaClient } = require("@prisma/client");
const redis = require("../utils/redis");
const prisma = new PrismaClient()

async function getInsights(req, res) {
    try {
        const userId = req.user
        const now = new Date()
        const threeMonthsAgo = new Date()
        threeMonthsAgo.setMonth(now.getMonth() - 3)
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const budgets = await prisma.budget.findMany({
            where: {
                userId,
                month,
                year
            },
            include: { category: true }
        })
        if (budgets.length === 0) {
            return res.status(404).json({
                message: "no budgets set yet"
            })
        }
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        })

        if (!wallet) {
            return res.status(404).json({
                message: "no wallet for the user"
            })
        }

        const transaction = await prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
                walletId: wallet.id,
                type: "DEBIT",
                createdAt: {
                    gte: threeMonthsAgo,
                    lte: now
                }
            }
            ,
            _sum: {
                amount: true
            }
        })

        const average = transaction.map((item) => {
            const avg = item._sum.amount / 3;
            return {
                categoryId: item.categoryId,
                avg
            }
        })

        const insights = budgets.map((budget) => {
            const spending = average.find(t => t.categoryId == budget.categoryId);
            if (!spending || spending.avg === 0) {
                return {
                    categoryId: budget.categoryId,
                    suggestion: "No spending in this category yet"
                }
            }
            if (spending.avg > budget.limitAmount) {
                savings = spending.avg * 0.2
                return {
                    categoryId: budget.categoryId,
                    spending: spending.avg,
                    budget: budget.limitAmount,
                    "suggestion": `You've spent ₹${spending.avg} on ${budget.category.name} this month vs your ₹${budget.limitAmount} budget. Cutting 20% would save ₹${savings}/month.`,
                    "potentialSavings": savings
                }

            } else {
                return {
                    categoryId: budget.categoryId,
                    spending: spending.avg,
                    budget: budget.limitAmount,
                    "suggestion": `Great job! You're under budget on ${budget.category.name} .`
                }
            }
        })

        return res.status(200).json({
            insights
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

module.exports = { getInsights }