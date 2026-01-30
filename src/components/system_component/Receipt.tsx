import type { Transaction } from '../../utils/currencyUtils'

interface ReceiptProps {
    transactions: Transaction[]
}

export default function Receipt({ transactions }: ReceiptProps) {
    const currentDate = new Date().toLocaleDateString('en-GB')
    const currentTime = new Date().toLocaleTimeString('en-GB')

    // Calculate grand total
    const grandTotal = transactions.reduce((sum, t) => sum + parseFloat(t.Total_TH || '0'), 0)

    return (
        <>
            <style>
                {`
          @media print {
            @page { margin: 0; size: auto; }
            body { margin: 0; }
          }
        `}
            </style>
            <div className="receipt w-[80mm] p-4 bg-white text-black font-mono text-[9px] leading-tight">
                <div className="flex items-center justify-between mb-2 pb-2">
                    <div className="w-[50%]">
                        <img src="/bdge_png.png" alt="Peter Exchange" className="w-full object-contain" />
                    </div>
                    <div className="w-[50%] text-right pl-2">
                        {/* <h1 className="text-sm font-bold">Peter Exchange</h1> */}
                        <div className="text-[8px] leading-tight">
                            <p>8 Nimmanhaemin Rd., Suthep, </p>
                            <p>Mueang Chiang Mai</p>
                            <p>Tel: 081-951-9678</p>
                        </div>
                        <div className="text-[8px] mt-1 font-bold">
                            {currentDate} {currentTime}
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <div className="flex justify-between text-[8px] border-b border-black border-dashed pb-1 mb-2 font-bold">
                        <div>Passport: {transactions[0]?.Customer_Passport_no || transactions[0]?.Passport_No || '-'}</div>
                        <div>Nationality: {transactions[0]?.Customer_Nationality || '-'}</div>
                    </div>
                    {/* Header Row */}
                    <div className="flex font-bold border-b border-black text-[8px] mb-1 pb-0.5">
                        <div className="w-[15%]">Cur</div>
                        <div className="w-[20%] text-right">Rate</div>
                        <div className="w-[30%] text-right">Amt</div>
                        <div className="w-[35%] text-right">THB</div>
                    </div>

                    {transactions.map((transaction, index) => (
                        <div key={index} className="flex mb-0.5">
                            <div className="w-[15%]">{transaction.Cur}</div>
                            <div className="w-[20%] text-right">{parseFloat(transaction.Rate).toString()}</div>
                            <div className="w-[30%] text-right">{Number(transaction.Amount).toLocaleString()}</div>
                            <div className="w-[35%] text-right font-bold">{Number(transaction.Total_TH).toLocaleString()}</div>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-black pt-1 mb-6">
                    <div className="flex justify-between font-bold text-xs">
                        <span>TOTAL:</span>
                        <span>฿{grandTotal.toLocaleString()}</span>
                    </div>
                </div>

                <div className="text-center">
                    <div className="border-t border-black border-dashed w-3/4 mx-auto pt-1"></div>
                    <p className="text-[8px] mt-1">
                        Customer Signature {transactions[0]?.Customer_Name ? `(${transactions[0].Customer_Name})` : '(Customer)'}
                    </p>
                </div>
            </div>
        </>
    )
}
