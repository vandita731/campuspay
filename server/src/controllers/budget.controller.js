const { PrismaClient } = require("@prisma/client");
const redis = require("../utils/redis");
const prisma = new PrismaClient()

async function setBudget(req, res) {
    try {
        const limitAmount = req.body.limitAmount;
        const categoryId = req.body.categoryId
        const month = req.body.month
        const year = req.body.year

        if (!categoryId || !limitAmount || !month || !year) {
            return res.status(400).json({ message: "Missing required fields" })
        }

        if (limitAmount <= 0) {
            return res.status(400).json({ message: "Limit must be positive" })
        }
        const userId = req.user
        const budget = await prisma.budget.upsert({
            where: {
                userId_month_year_categoryId: {
                    userId,
                    categoryId,
                    month,
                    year
                }
            },
            update: {
                month,
                year,
                limitAmount
            },
            create: {
                userId,
                categoryId,
                month,
                year, limitAmount
            }

        })

        return res.status(200).json({
            budget
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

async function getBudgetStatus(req, res) {
  try {
    const userId = req.user
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    
    const budget = await prisma.budget.findMany({
        where:{
            userId,
            month,
            year
        },
        include: { category: true }
    })



    const wallet = await prisma.wallet.findUnique({
        where:{userId}
    })

    if (!wallet) {
  return res.status(404).json({ message: "Wallet not found" })
}
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const transaction= await prisma.transaction.groupBy({
        by:["categoryId"],
        where:{
            walletId:wallet.id,
            type:"DEBIT",
            createdAt:{
                gte:startOfMonth,
                lte:endOfMonth
            }
        },
        _sum:{
            amount:true
        }
    })

    const calculateted = budget.map(bud =>{
        const spending = transaction.find(t => t.categoryId==bud.categoryId)
        const spent = spending ? spending._sum.amount : 0;
        const percentage = (spent / bud.limitAmount) * 100
        let status
        if(percentage<70){
             status = "safe"
        } else if(percentage<100){
             status="warning"
        } else{
             status="exceeded"
        }

        return { bud, spent, percentage, status }
    })

    return res.status(200).json({
        calculateted
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
        message:"something went wrong"
    })
  }
}

module.exports={getBudgetStatus,setBudget}

