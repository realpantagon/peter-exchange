import { useEffect, useState } from 'react'
import { hc } from 'hono/client'
import type { AppType } from '../../src-worker/index'

type Rate = {
  id: number
  Currency: string
  Cur: string
  Rate: string
}

const client = hc<AppType>('/')

export default function AdminPage() {
  const [rates, setRates] = useState<Rate[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    try {
      const response = await client.public.rates.$get()
      const data = await response.json()
      if ("error" in data) {
        console.error('Error fetching rates:', data.error)
        return
      }
      setRates(data)
    } catch (error) {
      console.error('Failed to fetch rates:', error)
    }
  }

  const getFlagIcon = (currencyCode: string) => {
    const baseUrl = 'https://peter-exchange.pages.dev'
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

  const startEdit = (rate: Rate) => {
    setEditingId(rate.id)
    setEditValue(rate.Rate)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (id: number) => {
    setLoading(true)
    try {
      const response = await client.public.rates[':id'].$put({
        param: { id: id.toString() },
        json: { Rate: editValue }
      })
      if (response.ok) {
        await fetchRates()
        setEditingId(null)
        setEditValue('')
      } else {
        const error = await response.json()
        alert(`Failed to update rate: ${error}`)
      }
    } catch (error) {
      console.error('Failed to update rate:', error)
      alert('Failed to update rate')
    }
    setLoading(false)
  }

  return (
    <div className="h-screen flex flex-col overflow-y-auto bg-gray-50">
      <div className="container mx-auto px-2 py-2 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <img src="512.png" alt="App Icon" className="w-8 h-8 rounded-full mr-2" />
          <h1 className="text-lg font-bold text-gray-800">PETER EXCHANGE</h1>
          <div className="ml-auto text-sm text-gray-500">
            {new Date().toLocaleDateString('en-GB')}{" "}
            {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow border border-gray-200 flex-1 flex flex-col max-w-md mx-auto w-full">
          {/* Header row */}
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 bg-gray-100 border-b border-gray-200 text-sm font-medium text-gray-700">
            <div className="px-1">Flag</div>
            <div className="px-1">Currency</div>
            <div className="px-1 text-right">Rate</div>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {rates.map((rate) => (
              <div key={rate.id} className="grid grid-cols-[auto_1fr_auto] gap-2 p-2 items-center hover:bg-gray-50 transition-colors">
                {/* Flag */}
                <div className="flex justify-center">
                  <img
                    src={getFlagIcon(rate.Cur)}
                    alt={`${rate.Cur} flag`}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/vite.svg'
                    }}
                  />
                </div>

                {/* Currency */}
                <div className="font-medium text-sm text-gray-800">{rate.Cur}</div>

                {/* Rate + edit mode */}
                <div className="flex items-center justify-end space-x-2">
                  {editingId === rate.id ? (
                    <>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="border border-blue-300 rounded px-2 py-1 w-20 text-right font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit(rate.id)
                          if (e.key === 'Escape') cancelEdit()
                        }}
                        autoFocus
                        placeholder="e.g. 30.00"
                      />
                      <button
                        onClick={() => saveEdit(rate.id)}
                        disabled={loading}
                        className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        {loading ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        disabled={loading}
                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-mono text-sm">{rate.Rate}</span>
                      <button
                        onClick={() => startEdit(rate)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        ✎
                      </button>
                    </>
                  )}
                </div>
              </div>    
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
