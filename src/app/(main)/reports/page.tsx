"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import ExpensesReport from "./ExpensesReport"
import SalesReport from "./SalesReport"

const today = format(new Date(), "yyyy-MM-dd")

export default function ReportsPage() {
  const [fromDate, setFromDate] = useState(today)
  const [toDate, setToDate] = useState(today)
  const [reportType, setReportType] = useState<
    'gym' | 'kitchen' | 'membership' | 'products' | 'kitchen_s'
  >('gym')

  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  // Grouping logic
  const isSalesReport = ['membership', 'products', 'kitchen_s'].includes(reportType)

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Reports</h1>

      <div className="flex items-end gap-4">
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">From</span>
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Till</span>
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">Report Type</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'gym' | 'kitchen' | 'membership' | 'products' | 'kitchen_s')}
            className="border p-2 rounded"
          >
            <option value="gym">Gym Expenses</option>
            <option value="kitchen">Kitchen Expenses</option>
            <option value="membership">Membership Sales</option>
            <option value="products">Product Sales</option>
            <option value="kitchen_s">Kitchen Sales</option>
          </select>
        </div>
      </div>

      {fromDate && toDate && (
        <>
          {isSalesReport ? (
            <SalesReport
              fromDate={fromDate}
              toDate={toDate}
              reportType={reportType as 'membership' | 'products' | 'kitchen_s'}
            />
          ) : (
            <ExpensesReport
              fromDate={fromDate}
              toDate={toDate}
              reportType={reportType as 'gym' | 'kitchen'}
            />
          )}
        </>
      )}
    </div>
  )
}
