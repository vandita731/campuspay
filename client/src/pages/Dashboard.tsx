import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { type Transaction, type Wallet, type BudgetStatus } from '../types'
import { walletApi } from "../api/wallet"
import { transactionApi } from "../api/transactions"
import { budgetApi } from "../api/budgets"
import Navbar from "../components/Navbar"

export default function Dashboard() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletD, transactionsD, budgetsD] = await Promise.all([
          walletApi.getWallet(),
          transactionApi.getTransactions(),
          budgetApi.getBudgetStatus()
        ])

        setWallet(walletD.wallet)
        setTransactions(transactionsD.transaction)
        setBudgetStatus(budgetsD.calculateted)

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
        {/* rest of dashboard */}
        <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Welcome back, {user?.name} 👋
          </h1>

          {/* Balance Card */}
          <div className="bg-indigo-600 text-white rounded-xl p-6 mb-6 shadow-md">
            <p className="text-sm opacity-75">Current Balance</p>
            <p className="text-4xl font-bold mt-1">₹{wallet?.balance}</p>
            <p className="text-xs opacity-60 mt-2">
              Last updated: {new Date(wallet?.updatedAt ?? '').toLocaleDateString()}
            </p>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Transactions</h2>
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center py-3 border-b last:border-0">
                <div>
                  <p className="font-medium text-gray-800">
                    {transaction.category?.icon} {transaction.category?.name ?? 'Top-up'}
                  </p>
                  <p className="text-sm text-gray-500">{transaction.note}</p>
                </div>
                <span className={`font-bold ${transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'}`}>
                  {transaction.type === 'CREDIT' ? '+' : '-'}₹{transaction.amount}
                </span>
              </div>
            ))}
            {transactions.length === 0 && (
              <p className="text-gray-400 text-center py-4">No transactions yet</p>
            )}
          </div>

          {/* Budget Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Budget Status</h2>
            {budgetStatus.length === 0 && (
              <p className="text-gray-400 text-center py-4">No budgets set yet</p>
            )}
            {budgetStatus.map((budget) => (
              <div key={budget.bud.id} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">
                    {budget.bud.category.icon} {budget.bud.category.name}
                  </span>
                  <span className={
                    budget.status === 'safe' ? 'text-green-600' :
                      budget.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }>
                    ₹{budget.spent} / ₹{budget.bud.limitAmount} ({budget.percentage}%)
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${budget.status === 'safe' ? 'bg-green-500' :
                        budget.status === 'warning' ? 'bg-yellow-400' : 'bg-red-500'
                      }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      
    </div>
  )
}