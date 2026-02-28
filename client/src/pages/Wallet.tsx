import { useState, useEffect } from "react"
import { type Wallet, type Category } from "../types"
import { walletApi } from "../api/wallet"
import { categoryApi } from "../api/categories"
import Navbar from "../components/Navbar"

export default function Wallet() {
    const [wallet, setWallet] = useState<Wallet | null>(null)
    const [categories, setCategories] = useState<Category[]>([])

    const [addAmount, setAddAmount] = useState('')
    const [addNote, setAddNote] = useState('')

    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [withdrawNote, setWithdrawNote] = useState('')
    const [categoryId, setCategoryId] = useState('')

    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState<'success' | 'error'>('success')
    const [loading, setLoading] = useState(true)
    const [addLoading, setAddLoading] = useState(false)
    const [withdrawLoading, setWithdrawLoading] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [walletD, categoriesD] = await Promise.all([
                    walletApi.getWallet(),
                    categoryApi.getCategories()
                ])
                setWallet(walletD.wallet)
                setCategories(categoriesD.categorys)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const refreshWallet = async () => {
        const walletD = await walletApi.getWallet()
        setWallet(walletD.wallet)
    }

    const handleAddMoney = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddLoading(true)
        try {
            const add = await walletApi.addMoney(Number(addAmount), addNote)
            await refreshWallet()
            setMessage(add.data.message)
            setMessageType('success')
            setAddAmount('')
            setAddNote('')
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Something went wrong')
            setMessageType('error')
        } finally {
            setAddLoading(false)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault()
        setWithdrawLoading(true)
        try {
            const withdraw = await walletApi.withdraw(Number(withdrawAmount), categoryId, withdrawNote)
            await refreshWallet()
            setMessage(withdraw.data.message)
            setMessageType('success')
            setWithdrawAmount('')
            setWithdrawNote('')
            setCategoryId('')
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Something went wrong')
            setMessageType('error')
        } finally {
            setWithdrawLoading(false)
            setTimeout(() => setMessage(''), 3000)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-indigo-600 font-semibold text-lg animate-pulse">Loading...</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="p-6 max-w-4xl mx-auto">

                {/* Balance Card */}
                <div className="relative bg-indigo-600 text-white rounded-2xl p-8 mb-6 shadow-lg overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-indigo-500 rounded-full opacity-40" />
                    <div className="absolute -bottom-8 -right-2 w-48 h-48 bg-indigo-700 rounded-full opacity-30" />
                    <div className="relative z-10">
                        <p className="text-sm font-medium opacity-75 uppercase tracking-widest">Current Balance</p>
                        <p className="text-5xl font-bold mt-2">₹{wallet?.balance}</p>
                        <p className="text-xs opacity-60 mt-3">
                            Last updated: {new Date(wallet?.updatedAt ?? '').toLocaleDateString('en-IN', {
                                day: 'numeric', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Toast Message */}
                {message && (
                    <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        messageType === 'success'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {messageType === 'success' ? '✅' : '❌'} {message}
                    </div>
                )}

                {/* Forms Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Add Money */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <span className="text-green-600 text-lg">＋</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800">Add Money</h2>
                        </div>

                        <form onSubmit={handleAddMoney} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-800 text-lg font-semibold"
                                    required
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Monthly allowance"
                                    value={addNote}
                                    onChange={(e) => setAddNote(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={addLoading}
                                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                            >
                                {addLoading ? 'Adding...' : '＋ Add Money'}
                            </button>
                        </form>
                    </div>

                    {/* Withdraw */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="bg-red-100 p-2 rounded-lg">
                                <span className="text-red-500 text-lg">−</span>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800">Withdraw</h2>
                        </div>

                        <form onSubmit={handleWithdraw} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-800 text-lg font-semibold"
                                    required
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700 bg-white"
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Note
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lunch at café"
                                    value={withdrawNote}
                                    onChange={(e) => setWithdrawNote(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 text-gray-700"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={withdrawLoading}
                                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-xl transition-colors duration-200"
                            >
                                {withdrawLoading ? 'Processing...' : '− Withdraw'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}