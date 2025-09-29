import { useEffect, useState } from 'react'

type Rate = {
  id: number
  Currency: string
  Cur: string
  Rate: number
}

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
      const response = await fetch(import.meta.env.VITE_API_URL)
      const data = await response.json()
      setRates(data)
    } catch (error) {
      console.error('Failed to fetch rates:', error)
    }
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

  const startEdit = (rate: Rate) => {
    setEditingId(rate.id)
    setEditValue(rate.Rate.toString())
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue('')
  }

  const saveEdit = async (id: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Rate: parseFloat(editValue)
        })
      })

      if (response.ok) {
        await fetchRates() // Refresh the data
        setEditingId(null)
        setEditValue('')
      } else {
        const error = await response.json()
        alert(`Failed to update rate: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update rate:', error)
      alert('Failed to update rate')
    }
    setLoading(false)
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      <div className="flex items-center justify-center mb-6">
        <img src="512.png" alt="App Icon" className="w-12 h-12 rounded-full mr-3" />
        <h1 className='text-2xl font-bold text-gray-800'>Peter Exchange Admin</h1>
      </div>

      <div className='space-y-4 max-w-md mx-auto'>
        {rates.map((rate) => (
          <div key={rate.id} className='bg-white rounded-lg shadow-md p-4 border border-gray-200'>
            <div className='flex items-center justify-between mb-3'>
              <div className='flex items-center space-x-3'>
                <img
                  src={getFlagIcon(rate.Cur)}
                  alt={`${rate.Cur} flag`}
                  className='w-12 h-12 rounded-full object-cover border-2 border-gray-200'
                  onError={(e) => {
                    e.currentTarget.src = 'http://localhost:5173/vite.svg'
                  }}
                />
                <div>
                  <div className='font-mono font-bold text-lg text-gray-800'>{rate.Cur}</div>
                  <div className='text-sm text-gray-500'>{rate.Currency}</div>
                </div>
              </div>

              {editingId !== rate.id && (
                <button
                  onClick={() => startEdit(rate)}
                  className='p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors'
                  title='Edit Rate'
                >
                  <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
                  </svg>
                </button>
              )}
            </div>

            <div className='border-t pt-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium text-gray-600'>Exchange Rate</span>

                {editingId === rate.id ? (
                  <div className='flex items-center space-x-2'>
                    <input
                      type='number'
                      step='0.0001'
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className='border-2 border-blue-300 rounded-lg px-3 py-2 w-28 text-right font-mono font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(rate.id)
                        if (e.key === 'Escape') cancelEdit()
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className='font-mono font-bold text-xl text-gray-900'>
                    {rate.Rate}
                  </span>
                )}
              </div>

              {editingId === rate.id && (
                <div className='flex justify-end space-x-3 mt-4'>
                  <button
                    onClick={cancelEdit}
                    disabled={loading}
                    className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors'
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(rate.id)}
                    disabled={loading}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}