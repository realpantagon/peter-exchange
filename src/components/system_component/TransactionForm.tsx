import { useRef, useEffect } from 'react'

interface TransactionFormProps {
  customRate: string
  setCustomRate: (rate: string) => void
  amount: string
  setAmount: (amount: string) => void
  transactionType: string
  setTransactionType: (type: string) => void
  calculateTotal: () => string
  onSave: () => void
  onCancel: () => void
  isEditing?: boolean
}

export default function TransactionForm({ 
  customRate, 
  setCustomRate, 
  amount, 
  setAmount, 
  transactionType,
  setTransactionType,
  calculateTotal, 
  onSave, 
  onCancel,
  isEditing = false
}: TransactionFormProps) {
  const amountInputRef = useRef<HTMLInputElement>(null)

  // Auto-focus amount field when form opens
  useEffect(() => {
    if (amountInputRef.current) {
      amountInputRef.current.focus()
    }
  }, [])

  // Prevent scroll wheel from changing number input values
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault()
    e.currentTarget.blur()
  }
  // Form validation
  const isValidForm = customRate.trim() !== '' && 
                     amount.trim() !== '' && 
                     parseFloat(customRate) > 0 && 
                     parseFloat(amount) > 0

  const handleSave = () => {
    if (isValidForm) {
      onSave()
    }
  }
  return (
    <div className="space-y-6">
      {/* Transaction Type Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
        >
          <option value="Buying">Buying</option>
          <option value="Selling">Selling</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Exchange Rate <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          step="0.0001"
          value={customRate}
          onChange={(e) => setCustomRate(e.target.value)}
          onWheel={handleWheel}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            customRate.trim() === '' || parseFloat(customRate) <= 0 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300'
          }`}
          placeholder="Enter exchange rate"
          required
        />
        {customRate.trim() !== '' && parseFloat(customRate) <= 0 && (
          <p className="mt-1 text-sm text-red-600">Exchange rate must be greater than 0</p>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Amount <span className="text-red-500">*</span>
        </label>
        <input
          ref={amountInputRef}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onWheel={handleWheel}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            amount.trim() === '' || parseFloat(amount) <= 0 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300'
          }`}
          placeholder="Enter amount"
          required
        />
        {amount.trim() !== '' && parseFloat(amount) <= 0 && (
          <p className="mt-1 text-sm text-red-600">Amount must be greater than 0</p>
        )}
      </div>
      
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">Total (THB):</span>
          <span className="font-bold text-2xl text-green-600">฿{calculateTotal()}</span>
        </div>
        <div className="text-sm text-gray-500 text-center">
          {amount || 0} × {customRate || 0} = ฿{calculateTotal()}
        </div>
      </div>
      
      <div className="flex gap-4 pt-2">
        <button 
          onClick={onCancel} 
          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={handleSave}
          disabled={!isValidForm}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            isValidForm
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isEditing ? 'Update Transaction' : 'Save Transaction'}
        </button>
      </div>
    </div>
  )
}