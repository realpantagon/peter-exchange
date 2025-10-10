import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { hc } from 'hono/client'
import type { AppType } from '../../src-worker/index'
import CurrencyCard from './system_component/CurrencyCard'
import CurrencyModal from './system_component/CurrencyModal'
import TransactionTable from './system_component/TransactionTable'
import type { Rate, Transaction } from '../utils/currencyUtils'
import { calculateExchangeTotal } from '../utils/currencyUtils'

const client = hc<AppType>('/')

export default function SystemPage() {
  const [searchParams] = useSearchParams()
  const branchId = searchParams.get('branchid')
  
  const [rates, setRates] = useState<Rate[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [customRate, setCustomRate] = useState('')
  const [transactionType, setTransactionType] = useState('Buying')
  
  // Edit mode
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  // Date filtering
  const [showTodayOnly, setShowTodayOnly] = useState(true)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  // Helper function to check if transaction is from today
  const isToday = (dateString: string) => {
    const today = new Date().toDateString()
    const transactionDate = new Date(dateString).toDateString()
    return today === transactionDate
  }

  // Filter transactions based on date settings
  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction.created_at) return false
    
    if (showTodayOnly) {
      return isToday(transaction.created_at)
    }
    
    if (dateFrom && dateTo) {
      const transactionDate = new Date(transaction.created_at)
      const fromDate = new Date(dateFrom)
      const toDate = new Date(dateTo)
      toDate.setHours(23, 59, 59, 999) // Include full day
      return transactionDate >= fromDate && transactionDate <= toDate
    }
    
    return true
  })

  useEffect(() => {
    if (branchId) {
      console.log('SystemPage loaded with branch ID:', branchId)
    }
    fetchRates()
    fetchTransactions()
  }, [branchId])

  const fetchRates = async () => {
    try {
      setLoading(true)
      // Include branch ID in the API call if available
      const queryParams = branchId ? { branchid: branchId } : {}
      const response = await client.public.rates.$get({ query: queryParams })
      const data = await response.json()
      if ("error" in data) {
        console.error('Error fetching rates:', data.error)
        return
      }
      setRates(data)
    } catch (error) {
      console.error('Failed to fetch rates:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    try {
      const queryParams = branchId ? { branchid: branchId } : {}
      const response = await client.public.transactions.$get({ query: queryParams })
      const data = await response.json()
      if ("error" in data) {
        console.error('Error fetching transactions:', data.error)
        return
      }
      setTransactions(data)
      console.log('Transactions loaded:', data)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    }
  }

  const handleCardClick = (rate: Rate) => {
    setSelectedRate(rate)
    setCustomRate(rate.Rate)
    setShowTransactionForm(false)
  }

  const handleNewTransaction = () => {
    setEditingTransaction(null)
    setShowTransactionForm(true)
    setAmount('')
    setTransactionType('Buying')
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setSelectedRate({
      id: 0, // We don't need this for editing
      Currency: transaction.Currency,
      Cur: transaction.Cur,
      Rate: transaction.Rate
    } as Rate)
    setCustomRate(transaction.Rate)
    setAmount(transaction.Amount)
    setTransactionType(transaction.Transaction_Type || 'Buying')
    setShowTransactionForm(true)
  }

  const calculateTotal = () => {
    return calculateExchangeTotal(customRate, amount)
  }

  const handleSaveTransaction = async () => {
    // Convert amount to negative if selling, then calculate total from that
    const finalAmount = transactionType === 'Selling' ? `-${amount}` : amount
    const total = calculateExchangeTotal(customRate, finalAmount)
    
    try {
      const transactionData = {
        Currency: selectedRate?.Currency || editingTransaction?.Currency || '',
        Cur: selectedRate?.Cur || editingTransaction?.Cur || '',
        Rate: customRate,
        Amount: finalAmount,
        Total_TH: total,
        Branch: branchId || undefined,
        Transaction_Type: transactionType as 'Buying' | 'Selling'
      }

      let response
      let actionText = ''

      if (editingTransaction) {
        // Update existing transaction
        response = await client.public.transactions[':id'].$put({
          param: { id: editingTransaction.id!.toString() },
          json: transactionData
        })
        actionText = 'updated'
      } else {
        // Create new transaction
        if (!selectedRate) return
        response = await client.public.transactions.$post({
          json: transactionData
        })
        actionText = 'created'
      }

      const result = await response.json()

      if ("error" in result) {
        console.error('Error saving transaction:', result.error)
        alert(`Failed to ${editingTransaction ? 'update' : 'save'} transaction: ` + result.error)
        return
      }

      console.log(`Transaction ${actionText} successfully:`, result)
      
      // Refresh transactions after saving
      fetchTransactions()
      
      // Reset form and close modal
      setShowTransactionForm(false)
      setAmount('')
      setSelectedRate(null)
      setEditingTransaction(null)
      
      // Show success message
      const currency = selectedRate?.Cur || editingTransaction?.Currency || ''
      const branchInfo = branchId ? `\nBranch ID: ${branchId}` : ''
      alert(`Transaction ${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Successfully!\nCurrency: ${currency}\nAmount: ${amount}\nRate: ${customRate}\nTotal THB: ${total}${branchInfo}`)
    } catch (error) {
      console.error('Failed to save transaction:', error)
      alert('Failed to save transaction. Please try again.')
    }
  }



  // Don't show loading overlay, let individual components handle their loading states

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 flex gap-4">
      {/* Sidebar - 1/5 of screen */}
      <div className="w-1/5 flex flex-col h-[calc(100vh-2rem)]">
        <div className="mb-3 flex flex-col items-center flex-shrink-0">
          <button
            onClick={() => {
              fetchRates()
              fetchTransactions()
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Currency cards */}
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto bg-white rounded-lg shadow-sm border border-gray-200 p-3 min-h-0">
          {/* <h3 className="text-sm font-semibold text-gray-700 mb-2">Exchange Rates</h3> */}
          {rates.sort((a, b) => a.id - b.id).map((rate) => (
            <CurrencyCard
              key={rate.id}
              rate={rate}
              isSelected={selectedRate?.id === rate.id}
              onClick={handleCardClick}
            />
          ))}
        </div>
      </div>

      {/* Transaction Table - 4/5 of screen */}
      <TransactionTable
        transactions={filteredTransactions}
        loading={loading}
        onRefresh={() => {
          fetchRates()
          fetchTransactions()
        }}
        branchId={branchId}
        showTodayOnly={showTodayOnly}
        setShowTodayOnly={setShowTodayOnly}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onEditTransaction={handleEditTransaction}
      />

      {/* Modal */}
      <CurrencyModal
        selectedRate={selectedRate}
        onClose={() => {
          setSelectedRate(null)
          setEditingTransaction(null)
        }}
        showTransactionForm={showTransactionForm}
        onNewTransaction={handleNewTransaction}
        customRate={customRate}
        setCustomRate={setCustomRate}
        amount={amount}
        setAmount={setAmount}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        calculateTotal={calculateTotal}
        onSaveTransaction={handleSaveTransaction}
        onCancelTransaction={() => {
          setShowTransactionForm(false)
          setEditingTransaction(null)
        }}
        isEditing={!!editingTransaction}
      />

    </div>
  )
}
