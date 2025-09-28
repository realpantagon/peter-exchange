"use client"

import { useEffect, useState } from "react"

type Rate = {
  id: number
  Currency: string
  Cur: string
  Rate: number
}

export default function Page() {
  const [rates, setRates] = useState<Rate[]>([])
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setNow(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => setRates(data))
  }, [])

  const getFlagIcon = (currencyCode: string) => {
    const flagMap: { [key: string]: string } = {
      AUD: "/AUD.png",
      CAD: "/CAD.png",
      CHF: "/CHF.png",
      CNY: "/CNY.png",
      EUR: "/EUR.png",
      GBP: "/GBP.png",
      HKD: "/HKD.png",
      JPY: "/JPY.png",
      KRW: "/KRW.png",
      MYR: "/MYR.png",
      NZD: "/NZD.png",
      SGD: "/SGD.png",
      TWD: "/TWD.png",
      USD: "/USA.png",
      USD2: "/USA.png",
      USD1: "/USA.png",
    }
    return flagMap[currencyCode] || "/vite.svg"
  }

  return (
    <div className="h-screen w-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 pt-2 flex-shrink-0 flex items-center justify-between">
        <img src="/bdge_png.png" alt="Peter Exchange Logo" className="h-20" />
        <span className="text-lg sm:text-2xl font-semibold text-emerald-600 flex items-center gap-2">
          <span className="text-gray-500 font-mono text-3xl sm:text-3xl">{now}</span>
        </span>
      </div>

      <div className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
          <div className="hidden md:flex flex-col h-full">
            <table className="w-full flex-1">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 lg:px-8 py-4 lg:py-6 text-left text-sm lg:text-lg font-semibold text-gray-700 uppercase tracking-wider">
                    Currency
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-6 text-left text-sm lg:text-lg font-semibold text-gray-700 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 lg:px-8 py-4 lg:py-6 text-right text-sm lg:text-lg font-semibold text-gray-700 uppercase tracking-wider">
                    Exchange Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rates.map((rate, index) => (
                  <tr key={rate.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 1 ? 'bg-gray-100' : 'bg-white'
                    }`}>
                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                      <div className="flex items-center space-x-3 lg:space-x-4">
                        <img
                          src={getFlagIcon(rate.Cur) || "/placeholder.svg"}
                          alt={`${rate.Cur} flag`}
                          className="w-14 h-14 lg:w-14 lg:h-14 rounded-full object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = "/vite.svg"
                          }}
                        />
                        <div className="text-xl lg:text-3xl font-semibold text-gray-900">{rate.Currency}</div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-6">
                      <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-md text-lg lg:text-2xl font-mono font-bold text-gray-800 bg-gray-100">
                        {rate.Cur}
                      </span>
                    </td>
                    <td className="px-4 lg:px-8 py-4 lg:py-6 text-right">
                      <div className="text-2xl lg:text-4xl font-bold text-gray-900 font-mono">
                        {rate.Rate.toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden h-full overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {rates.map((rate, index) => (
                <div key={rate.id} className={`p-4 sm:p-6 hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 1 ? 'bg-gray-100' : 'bg-white'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <img
                        src={getFlagIcon(rate.Cur) || "/placeholder.svg"}
                        alt={`${rate.Cur} flag`}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-gray-200"
                        onError={(e) => {
                          e.currentTarget.src = "/vite.svg"
                        }}
                      />
                      <div>
                        <div className="text-lg sm:text-xl font-semibold text-gray-900">{rate.Currency}</div>
                        <span className="inline-flex items-center px-2 py-1 rounded text-sm sm:text-base font-mono font-bold text-gray-700 bg-gray-100 mt-1">
                          {rate.Cur}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm sm:text-base font-medium text-gray-500 mb-1">Rate</div>
                      <div className="text-xl sm:text-2xl font-bold text-gray-900 font-mono">
                        {rate.Rate.toLocaleString("en-US", {
                          minimumFractionDigits: 4,
                          maximumFractionDigits: 4,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
