import { useState, useEffect } from 'react'
import { hc } from 'hono/client'
import type { AppType } from '../../src-worker/index'

type Rate = {
  id: number
  Currency: string
  Cur: string
  Rate: string
}

const client = hc<AppType>('/')

export default function SystemPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [customRate, setCustomRate] = useState('')

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      setLoading(true)
      const response = await client.public.rates.$get()
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

  const handleCardClick = (rate: Rate) => {
    setSelectedRate(rate)
    setCustomRate(rate.Rate)
    setShowTransactionForm(false)
    console.log('Selected rate:', rate)
  }

  const handleNewTransaction = () => {
    setShowTransactionForm(true)
    setAmount('')
  }

  const calculateTotal = () => {
    const rateValue = parseFloat(customRate) || 0
    const amountValue = parseFloat(amount) || 0
    return (rateValue * amountValue).toFixed(2)
  }

  const handleSaveTransaction = () => {
    const total = calculateTotal()
    alert(`Transaction Saved!\nCurrency: ${selectedRate?.Cur}\nAmount: ${amount}\nRate: ${customRate}\nTotal THB: ${total}`)
    setShowTransactionForm(false)
    setAmount('')
  }

  const getFlagIcon = (currencyCode: string) => {
    const baseUrl = 'https://peter-exchange.pages.dev' // fe-rate-display URL
    const flagMap: { [key: string]: string } = {
      AUD: `${baseUrl}/AUD.png`,
      CAD: `${baseUrl}/CAD.png`,
      CHF: `${baseUrl}/CHF.png`,
      CNY: `${baseUrl}/CNY.png`,
      EUR: `${baseUrl}/EUR.png`,
      GBP: `${baseUrl}/GBP.png`,
      HKD: `${baseUrl}/HKD.png`,
      JPY: `${baseUrl}/JPY.png`,
      KRW: `${baseUrl}/KRW.png`,
      MYR: `${baseUrl}/MYR.png`,
      NZD: `${baseUrl}/NZD.png`,
      SGD: `${baseUrl}/SGD.png`,
      TWD: `${baseUrl}/TWD.png`,
      USD: `${baseUrl}/USA.png`,
      USD2: `${baseUrl}/USA.png`,
      USD1: `${baseUrl}/USA.png`,
    }
    return flagMap[currencyCode] || `${baseUrl}/vite.svg`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exchange rates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-2 flex">
      {/* Left Sidebar with Cards */}
      <div className="w-1/5 flex flex-col mx-4">
        {/* Header above cards */}
        <div className="mb-4 p-2 ">
          <img src="Ex_logo_6.png" alt="App Icon" className="" />
          <button
            onClick={fetchRates}
            className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Currency Cards */}
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          {rates
            .sort((a, b) => a.id - b.id)
            .map((rate) => (
              <div
                key={rate.id}
                onClick={() => handleCardClick(rate)}
                className={`bg-white rounded shadow-sm p-2 cursor-pointer transition-all duration-200 hover:shadow-md border ${selectedRate?.id === rate.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 flex-shrink-0">
                    <img
                      src={getFlagIcon(rate.Cur)}
                      alt={`${rate.Cur} flag`}
                      className="w-6 h-6 rounded-full object-cover border border-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = 'https://peter-exchange.pages.dev/vite.svg'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-gray-800 truncate">
                      {rate.Cur}
                    </div>
                    <div className="text-xs text-gray-600 truncate leading-3">
                      {rate.Currency}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-gray-900">
                      {rate.Rate}
                    </div>
                  </div>
                </div>

                {selectedRate?.id === rate.id && (
                  <div className="mt-1 pt-1 border-t border-blue-200">
                    <div className="text-xs text-blue-600 text-center">
                      ✓ Selected
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Selected Rate Details */}
      {selectedRate && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Selected Currency Details
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <div className="mb-2">
                <img
                  src={getFlagIcon(selectedRate.Cur)}
                  alt={`${selectedRate.Cur} flag`}
                  className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 mx-auto"
                  onError={(e) => {
                    e.currentTarget.src = 'https://peter-exchange.pages.dev/vite.svg'
                  }}
                />
              </div>
              <div className="font-bold text-2xl text-gray-800">{selectedRate.Cur}</div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Currency:</span>
                <span className="ml-2 font-semibold">{selectedRate.Currency}</span>
              </div>
              <div>
                <span className="text-gray-600">Exchange Rate:</span>
                <span className="ml-2 font-bold text-xl text-green-600">{selectedRate.Rate}</span>
              </div>
              <div>
                <span className="text-gray-600">ID:</span>
                <span className="ml-2">{selectedRate.id}</span>
              </div>
            </div>
          </div>

          {/* Transaction Form */}
          {!showTransactionForm ? (
            <button
              onClick={handleNewTransaction}
              className="w-full mb-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              + Add New Transaction
            </button>
          ) : (
            <div className="border-t pt-6 mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">New Transaction</h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exchange Rate ({selectedRate.Cur} to THB)
                  </label>
                  <input
                    type="text"
                    value={customRate}
                    onChange={(e) => setCustomRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount ({selectedRate.Cur})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    autoFocus
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-700">Total (THB):</span>
                    <span className="text-2xl font-bold text-green-600">
                      ฿{calculateTotal()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {amount || '0'} {selectedRate.Cur} × {customRate || '0'} = ฿{calculateTotal()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowTransactionForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveTransaction}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Transaction
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clear Selection Button at Bottom */}
          <div className="border-t pt-4 mt-6">
            <button
              onClick={() => setSelectedRate(null)}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {rates.length === 0 && !loading && (
        <div className="text-center text-gray-600 mt-12">
          <p className="text-xl mb-2">No exchange rates found</p>
          <p>Try refreshing to load the latest rates</p>
        </div>
      )}
    </div>
  )
}