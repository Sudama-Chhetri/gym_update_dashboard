"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import * as XLSX from "xlsx"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function SalesReport({ fromDate, toDate, reportType }: { fromDate: string, toDate: string, reportType: string }) {
  const supabase = createClientComponentClient()

  const [membershipSales, setMembershipSales] = useState([])
  const [productSales, setProductSales] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5

  const flatProductRows = productSales.flatMap((s) => {
    if (!s.items_json) return []
    try {
      const items = typeof s.items_json === "string" ? JSON.parse(s.items_json) : s.items_json
      return items.map((item: any, index: number) => ({
        ...item,
        customer_name: s.member_name || "-",
        payment_method: s.payment_method,
        discount: s.discount ?? "-",
        amount: index === 0 ? s.amount_paid || 0 : 0,
      }))
    } catch (e) {
      console.error("Error parsing items_json:", s.items_json, e)
      return []
    }
  })

  const paginatedMemberships = membershipSales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
  const paginatedProducts = flatProductRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const totalPages = Math.ceil(
    reportType === "membership" ? membershipSales.length / ITEMS_PER_PAGE :
    reportType === "products" || reportType === "kitchen" ? flatProductRows.length / ITEMS_PER_PAGE :
    1
  )

  useEffect(() => {
    const fetchSales = async () => {
      if (reportType === "membership") {
        const { data: memberships } = await supabase
          .from("sales")
          .select("member_name, member_phone, membership_start_date, membership_end_date, membership_type, amount_paid, payment_method, time_of_purchase, category")
          .eq("service_name", "Membership")
          .gte("time_of_purchase", fromDate)
          .lte("time_of_purchase", toDate)

        setMembershipSales(memberships || [])
      }

      if (reportType === "products") {
        const { data: products } = await supabase
        .from("sales")
        .select("member_name, items_json, payment_method, amount_paid, discount, time_of_purchase")
        .eq("service_name", "Product Purchase")
        .eq("payment_status", "paid") 
        .gte("time_of_purchase", fromDate)
        .lte("time_of_purchase", toDate)

        setProductSales(products || [])
      }

      if (reportType === "kitchen") {
        const { data: kitchen } = await supabase
        .from("sales")
        .select("member_name, items_json, payment_method, amount_paid, discount, time_of_purchase")
        .eq("service_name", "Restaurant")
        .eq("payment_status", "paid") 
        .gte("time_of_purchase", fromDate)
        .lte("time_of_purchase", toDate)

        setProductSales(kitchen || [])
      }

      setCurrentPage(1)
    }

    if (fromDate && toDate) fetchSales()
  }, [fromDate, toDate, reportType, supabase])

  const getMembershipType = (name: string, phone: string) => {
    const current = `${name}-${phone}`
    const count = membershipSales.filter(s => `${s.member_name}-${s.member_phone}` === current).length
    return count > 1 ? "Renewal" : "New"
  }

  const formattedFrom = format(new Date(fromDate), "MMMM d, yyyy")
  const formattedTo = format(new Date(toDate), "MMMM d, yyyy")

  const totalMembership = membershipSales.reduce((sum, s) => sum + (s.amount_paid || 0), 0)
  const totalProduct = flatProductRows.reduce((sum, s) => sum + (s.amount || 0), 0)

  const handleProductExportXLSX = () => {
    const heading = `${reportType === "kitchen" ? "Kitchen" : "Product"} Sales Report ${fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}`

    const rows: any[] = flatProductRows.map((item) => ([
      item.name,
      item.customer_name,
      item.cost_price,
      item.quantity,
      item.amount,
      item.tax,
      item.discount,
      item.payment_method
    ]))

    const worksheetData = [
      [heading],
      ["Product", "Customer", "Price", "Quantity", "Total", "Tax", "Discount", "Payment"],
      ...rows,
      ["", "", "", "", totalProduct, "", "", ""]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    for (let C = 0; C < 8; C++) {
      const cell = XLSX.utils.encode_cell({ r: 1, c: C })
      if (!worksheet[cell]) continue
      worksheet[cell].s = { font: { bold: true } }
    }
    worksheet['!cols'] = Array(8).fill({ wch: 20 })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType === "kitchen" ? "Kitchen" : "Product"} Report`)
    XLSX.writeFile(workbook, `${reportType}-sales-${fromDate}_to_${toDate}.xlsx`)
  }

  const handleMembershipExportXLSX = () => {
    const heading = `Membership Sales Report ${fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}`

    const rows = membershipSales.map((s) => ([
      s.member_name,
      s.member_phone,
      s.membership_type,
      getMembershipType(s.member_name, s.member_phone),
      s.membership_start_date,
      s.membership_end_date,
      s.payment_method,
      s.amount_paid
    ]))

    const worksheetData = [
      [heading],
      ["Name", "Phone", "Plan", "Type", "Start", "End", "Payment", "Amount"],
      ...rows,
      ["", "", "", "", "", "", "Total", totalMembership]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    worksheet['!cols'] = Array(8).fill({ wch: 20 })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Membership Report")
    XLSX.writeFile(workbook, `membership-sales-${fromDate}_to_${toDate}.xlsx`)
  }

  return (
    <div className="space-y-10">
      {reportType === "membership" && (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-semibold">
              Membership Sales Report {fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}
            </h2>
            <Button onClick={handleMembershipExportXLSX}>
              <DownloadIcon className="w-4 h-4 mr-2" /> Export Membership XLSX
            </Button>
          </div>

          <div className="bg-white shadow rounded p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 font-bold">Member</th>
                  <th className="font-bold">Contact</th>
                  <th className="font-bold">Start</th>
                  <th className="font-bold">End</th>
                  <th className="font-bold">Plan</th>
                  <th className="font-bold">Category</th>
                  <th className="font-bold">Type</th>
                  <th className="font-bold">Amount</th>
                  <th className="font-bold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMemberships.map((s, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{s.member_name}</td>
                    <td>{s.member_phone}</td>
                    <td>{format(new Date(s.membership_start_date), "yyyy-MM-dd")}</td>
                    <td>{format(new Date(s.membership_end_date), "yyyy-MM-dd")}</td>
                    <td>{s.membership_type}</td>
                    <td>{s.category}</td>
                    <td>{getMembershipType(s.member_name, s.member_phone)}</td>
                    <td>₹{s.amount_paid}</td>
                    <td>{s.payment_method}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={7}>Total</td>
                  <td>₹{totalMembership}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(reportType === "products" || reportType === "kitchen") && (
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-semibold">
              {reportType === "kitchen" ? "Kitchen" : "Product"} Sales Report {fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}
            </h2>
            <Button onClick={handleProductExportXLSX}>
              <DownloadIcon className="w-4 h-4 mr-2" /> Export {reportType === "kitchen" ? "Kitchen" : "Product"} XLSX
            </Button>
          </div>
          <div className="bg-white shadow rounded p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 font-bold">Product</th>
                  <th className="font-bold">Customer</th>
                  <th className="font-bold">Price</th>
                  <th className="font-bold">Qty</th>
                  <th className="font-bold">Total</th>
                  <th className="font-bold">Tax</th>
                  <th className="font-bold">Discount</th>
                  <th className="font-bold">Payment</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td>{item.customer_name}</td>
                    <td>₹{item.cost_price}</td>
                    <td>{item.quantity}</td>
                    <td>₹{item.amount}</td>
                    <td>{item.tax}%</td>
                    <td>{item.discount}%</td>
                    <td>{item.payment_method}</td>
                  </tr>
                ))}
                <tr className="font-semibold">
                  <td colSpan={4}>Total</td>
                  <td>₹{totalProduct}</td>
                  <td colSpan={3}></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} size="sm">Previous</Button>
        <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
        <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} size="sm">Next</Button>
      </div>
    </div>
  )
}
