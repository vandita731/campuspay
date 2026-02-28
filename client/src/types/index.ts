// 1. User
export interface User {
    id :string
    name:string
    email:string
 }

// 2. Wallet  
export interface Wallet {
    id :string
    userId:string
    balance:string
    updatedAt:string

 }

// 3. Category
export interface Category { 
    id:string
    name:string
    icon:string | null
    userId:string | null
 }

// 4. Transaction (hint: has a nested Category, and type is either "CREDIT" or "DEBIT")
export interface Transaction { 
    id:string
    walletId:string
    amount:string
    createdAt: string
    category: Category | null
    type:"CREDIT" | "DEBIT"
    categoryId:string | null
    note : string | null
 }

// 5. Budget
export interface Budget { 
    category: Category
    id:string
    userId:string
    categoryId:string
    limitAmount:string
    month:number
    year:number
}

// 6. BudgetStatus (the response from /api/budgets/status)
// bud, spent, percentage, status
export interface BudgetStatus { 
    bud:Budget
    spent:number
    percentage:number
    status: "safe" | "warning" | "exceeded"
 }

// 7. Insight (the response from /api/insights/getInsights)
// categoryId: budget.categoryId,
                    // spending: spending.avg,
                    // budget: budget.limitAmount,
                    // "suggestion": `You've spent ₹${spending.avg} on ${budget.category.name} this month vs your ₹${budget.limitAmount} budget. Cutting 20% would save ₹${savings}/month.`,
                    // "potentialSavings": savings
export interface Insight { 
    categoryId: string
    spending:number
    budget:number
    suggestion:string
    potentialSavings?:number
 }

