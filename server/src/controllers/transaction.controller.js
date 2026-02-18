const { PrismaClient } = require("@prisma/client");
const redis = require("../utils/redis");
const prisma = new PrismaClient()

async function getTransactions(req, res) {
    try {
        const userId = req.user;
        const wallet = await prisma.wallet.findUnique({
            where: { userId }
        })
        if (!wallet) {
            return res.status(404).json({ message: "Wallet not found" })
        }
        const transaction = await prisma.transaction.findMany({
            where: { walletId: wallet.id },
            include: { category: true },
            orderBy: { createdAt: "desc" }
        })
        return res.status(200).json({
            transaction
        })
    } catch (error) {
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

async function getTransactionSummary(req, res) {
    try{

        
        const userId = req.user;
        const now = new Date();

    const cachekey=`summary:${userId}:${now.getFullYear()}-${now.getMonth()+1}`;
    const cached = await redis.get(cachekey);
    if(cached){
        return res.status(200).json({
            summary:cached,
            cached:true
        })
    }
        
    const wallet = await prisma.wallet.findUnique({
        where: { userId }
    })
    if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" })
    }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const transaction = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            walletId: wallet.id,
            type: "DEBIT",
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        },
        _sum:{
            amount:true
        }
    })

    const summary = await Promise.all(
        transaction.map(async(s) =>{
            const category=await prisma.category.findUnique({
                where:{id:s.categoryId}
            })
            return {
                categoryId:s.categoryId,
                categoryName:category.name || "unknown",
                total:s._sum.amount
            }
        })
    )
    await redis.set(cachekey,summary,{ex:3600})
    return res.status(200).json({ summary,cached:false })


    } catch (error) {
        return res.status(500).json({
            message: "something went wrong"
        })
    }
}

module.exports = { getTransactionSummary, getTransactions }