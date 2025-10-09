import TransactionForm from './TransactionForm'
import type { Rate } from '../../utils/currencyUtils'
import { getFlagIcon } from '../../utils/currencyUtils'

interface CurrencyModalProps {
  selectedRate: Rate | null
  onClose: () => void
  showTransactionForm: boolean
  onNewTransaction: () => void
  customRate: string
  setCustomRate: (rate: string) => void
  amount: string
  setAmount: (amount: string) => void
  transactionType: string
  setTransactionType: (type: string) => void
  calculateTotal: () => string
  onSaveTransaction: () => void
  onCancelTransaction: () => void
  isEditing: boolean
}

export default function CurrencyModal({
  selectedRate,
  onClose,
  showTransactionForm,
  onNewTransaction,
  customRate,
  setCustomRate,
  amount,
  setAmount,
  transactionType,
  setTransactionType,
  calculateTotal,
  onSaveTransaction,
  onCancelTransaction,
  isEditing
}: CurrencyModalProps) {
  if (!selectedRate) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-4 w-full max-w-md mx-2 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Currency</h3>
          <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-green-500 mx-auto"></div>
        </div>

        {/* Currency Info */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 mb-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={getFlagIcon(selectedRate.Cur)}
                alt={`${selectedRate.Cur} flag`}
                className="w-12 h-12 rounded-full border-2 border-white shadow object-cover"
              />
              <div>
                <div className="font-bold text-lg text-gray-800">{selectedRate.Cur}</div>
                <div className="text-xs text-gray-600">{selectedRate.Currency}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-500 uppercase">Rate</div>
              <div className="font-bold text-xl text-green-600">{selectedRate.Rate}</div>
              <div className="text-[10px] text-gray-500">THB</div>
            </div>
          </div>
        </div>

        {/* Content */}
        {!showTransactionForm ? (
          <button
            onClick={onNewTransaction}
            className="w-full py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium text-sm transition"
          >
            + Add Transaction
          </button>
        ) : (
          <TransactionForm
            customRate={customRate}
            setCustomRate={setCustomRate}
            amount={amount}
            setAmount={setAmount}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            calculateTotal={calculateTotal}
            onSave={onSaveTransaction}
            onCancel={onCancelTransaction}
            isEditing={isEditing}
          />
        )}
      </div>
    </div>
  )
}
