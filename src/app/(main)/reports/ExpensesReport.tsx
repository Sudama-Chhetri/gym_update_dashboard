"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import * as XLSX from "xlsx"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Expense {
  expense_id: string;
  name: string;
  amount: number;
  type_of_expense: string;
  date_of_expense: string;
  department: string;
}

export default function ExpensesReport({ fromDate, toDate, reportType }: { fromDate: string, toDate: string, reportType: 'gym' | 'kitchen' }) {
  const supabase = createClientComponentClient()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5
  const paginatedExpenses = expenses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE)

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data } = await supabase
        .from("expenses")
        .select("expense_id, name, amount, type_of_expense, date_of_expense, department")
        .gte("date_of_expense", fromDate)
        .lte("date_of_expense", toDate)
        .eq("type_of_expense", reportType)

      if (data) setExpenses(data)
      setCurrentPage(1)
    }

    if (fromDate && toDate) fetchExpenses()
  }, [reportType, fromDate, toDate, supabase])

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  const formattedFrom = format(new Date(fromDate), "MMMM d, yyyy")
  const formattedTo = format(new Date(toDate), "MMMM d, yyyy")

  const handleExportXLSX = () => {
    const heading = `${reportType === 'gym' ? 'Gym' : 'Kitchen'} Expenses Report ${fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}`
    const worksheetData = [
      [heading],
      ["ID", "Name", "Amount", "Date", "Department"],
      ...expenses.map((e) => [
        e.expense_id,
        e.name,
        e.amount,
        format(new Date(e.date_of_expense), "yyyy-MM-dd"),
        e.department,
      ]),
      ["", "Total", totalExpenses, "", ""]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report")
    XLSX.writeFile(workbook, `${reportType}-expenses-${fromDate}_to_${toDate}.xlsx`)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-semibold">
          {reportType === 'gym' ? 'Gym' : 'Kitchen'} Expenses Report {fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}
        </h2>
        <Button onClick={handleExportXLSX}><DownloadIcon className="w-4 h-4 mr-2" /> Export XLSX</Button>
      </div>

      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">ID</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Department</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.map((e) => (
              <tr key={e.expense_id} className="border-b">
                <td className="py-2">{e.expense_id}</td>
                <td>{e.name}</td>
                <td>₹{e.amount}</td>
                <td>{format(new Date(e.date_of_expense), "yyyy-MM-dd")}</td>
                <td>{e.department}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td></td>
              <td>Total</td>
              <td>₹{totalExpenses}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-end mt-4 gap-2">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} size="sm">Previous</Button>
          <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} size="sm">Next</Button>
        </div>
      </div>
    </div>
  )
}
