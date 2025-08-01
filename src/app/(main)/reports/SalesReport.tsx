"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { DownloadIcon } from "lucide-react"
import * as XLSX from "xlsx"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { KitchenItem, ProductItem } from "@/types"

interface MembershipSale {
  member_name: string;
  member_phone: string;
  membership_start_date: string;
  membership_end_date: string;
  membership_type: string;
  amount_paid: number;
  payment_method: string;
  time_of_purchase: string;
  category: string;
}

interface SaleItem {
  member_name: string;
  items_json: string | KitchenItem[] | ProductItem[];
  payment_method: string;
  amount_paid: number;
  discount: number;
  time_of_purchase: string;
}

interface FlatProductRow {
  name: string;
  customer_name: string;
  cost_price: string;
  quantity: string;
  tax: string;
  discount: number;
  amount: number;
  payment_method: string;
  selling_price?: string; // Optional for kitchen items
}

export default function SalesReport({ fromDate, toDate, reportType }: { fromDate: string, toDate: string, reportType: string }) {
  const supabase = createClientComponentClient()

  const [membershipSales, setMembershipSales] = useState<MembershipSale[]>([])
  const [productSales, setProductSales] = useState<SaleItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const ITEMS_PER_PAGE = 5

  const formattedFrom = format(new Date(fromDate), "MMMM d, yyyy")
  const formattedTo = format(new Date(toDate), "MMMM d, yyyy")

  useEffect(() => {
    const fetchSales = async () => {
      if (reportType === "membership") {
        const { data: memberships } = await supabase
          .from("sales")
          .select("member_name, member_phone, membership_start_date, membership_end_date, membership_type, amount_paid, payment_method, time_of_purchase, category")
          .eq("service_name", "Membership")
          .gte("time_of_purchase", fromDate)
          .lte("time_of_purchase", `${toDate}T23:59:59`)

        setMembershipSales(memberships || [])
      }

      if (reportType === "products" || reportType === "kitchen_s") {
        const { data: items }: { data: SaleItem[] | null } = await supabase
          .from("sales")
          .select("member_name, items_json, payment_method, amount_paid, discount, time_of_purchase")
          .eq("service_name", reportType === "products" ? "Product Purchase" : "Restaurant Sale")
          .eq("payment_status", "paid")
          .gte("time_of_purchase", fromDate)
          .lte("time_of_purchase", `${toDate}T23:59:59`)

        setProductSales(items || [])
      }
    }

    if (fromDate && toDate) fetchSales()
  }, [fromDate, toDate, reportType, supabase])

  const getMembershipType = (name: string, phone: string) => {
    const current = `${name}-${phone}`
    const count = membershipSales.filter(s => `${s.member_name}-${s.member_phone}` === current).length
    return count > 1 ? "Renewal" : "New"
  }

  const flatProductRows = reportType === "kitchen_s"
    ? productSales.map((s) => {
        if (!s.items_json) return null;
        try {
          const items = typeof s.items_json === "string" ? JSON.parse(s.items_json) as KitchenItem[] : s.items_json as KitchenItem[];
          const names = items.map((item: KitchenItem) => item.name).join(", ");
          const quantities = items.map((item: KitchenItem) => item.quantity).join(" + ");
          const taxes = items.map((item: KitchenItem) => `${item.tax}%`).join(" + ");
          const costPrices = items.map((item: KitchenItem) => `₹${item.cost}`).join(" + ");
          return {
            name: names,
            customer_name: s.member_name || "-",
            cost_price: costPrices,
            quantity: quantities,
            tax: taxes,
            discount: s.discount ?? "-",
            amount: s.amount_paid || 0,
            payment_method: s.payment_method,
          };
        } catch (e) {
          console.error("Error parsing kitchen items_json:", s.items_json, e);
          return null;
        }
      }).filter(Boolean) as FlatProductRow[]
    : productSales.map((s) => {
        if (!s.items_json) return null;
        try {
          const items = typeof s.items_json === "string" ? JSON.parse(s.items_json) as ProductItem[] : s.items_json as ProductItem[];
          const names = items.map((item: ProductItem) => item.name).join(", ");
          const quantities = items.map((item: ProductItem) => item.quantity).join(" + ");
          const taxes = items.map((item: ProductItem) => `${item.tax}%`).join(" + ");
          const costPrices = items.map((item: ProductItem) => `₹${item.cost_price}`).join(" + ");
          const sellPrices = items.map((item: ProductItem) => `₹${item.selling_price}`).join(" + ");
          return {
            name: names,
            customer_name: s.member_name || "-",
            cost_price: costPrices,
            selling_price: sellPrices,
            quantity: quantities,
            tax: taxes,
            discount: s.discount ?? "-",
            amount: s.amount_paid || 0,
            payment_method: s.payment_method,
          };
        } catch (e) {
          console.error("Error parsing product items_json:", s.items_json, e);
          return null;
        }
      }).filter(Boolean) as FlatProductRow[];

  const totalMembership = membershipSales.reduce((sum, s) => sum + (s.amount_paid || 0), 0)
  const totalProduct = flatProductRows.reduce((sum, s) => sum + (s?.amount || 0), 0)

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

  const handleProductExportXLSX = () => {
    const heading = `${reportType === "kitchen_s" ? "Kitchen" : "Product"} Sales Report ${fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}`

    const rows: (string | number)[][] = flatProductRows.map((item) => {
      if (!item) return []; // Handle null items
      const typedItem = item as FlatProductRow;
      return reportType === "kitchen_s" ? [
        typedItem.name,
        typedItem.customer_name,
        typedItem.cost_price,
        typedItem.quantity,
        typedItem.tax,
        typedItem.discount,
        typedItem.amount,
        typedItem.payment_method
      ] : [
        typedItem.name,
        typedItem.customer_name,
        typedItem.cost_price,
        typedItem.selling_price || "N/A", // Handle optional selling_price
        typedItem.quantity,
        typedItem.tax,
        typedItem.discount,
        typedItem.amount,
        typedItem.payment_method
      ];
    });

    const worksheetData = [
      [heading],
      reportType === "kitchen_s"
        ? ["Item(s)", "Customer", "Price", "Qty", "Tax", "Discount", "Total", "Payment"]
        : ["Product", "Customer", "Cost Price", "Selling Price", "Qty", "Tax", "Discount", "Total", "Payment"],
      ...rows,
      reportType === "kitchen_s"
        ? ["", "", "", "", "", "Total", totalProduct, ""]
        : ["", "", "", "", "", "", "Total", totalProduct, ""]
    ]

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData)
    worksheet['!cols'] = Array(9).fill({ wch: 20 })

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, `${reportType === "kitchen_s" ? "Kitchen" : "Product"} Report`)
    XLSX.writeFile(workbook, `${reportType}-sales-${fromDate}_to_${toDate}.xlsx`)
  }

  if (reportType === "membership") {
    return (
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
              {membershipSales.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((s, i) => (
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
        <div className="flex justify-end mt-4 gap-2">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} size="sm">Previous</Button>
          <span className="text-sm px-2">Page {currentPage}</span>
          <Button disabled={(currentPage * ITEMS_PER_PAGE) >= membershipSales.length} onClick={() => setCurrentPage(prev => prev + 1)} size="sm">Next</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <h2 className="text-xl font-semibold">
          {reportType === "kitchen" ? "Kitchen" : "Product"} Sales Report {fromDate === toDate ? `for ${formattedFrom}` : `from ${formattedFrom} to ${formattedTo}`}
        </h2>
        <Button onClick={handleProductExportXLSX}>
          <DownloadIcon className="w-4 h-4 mr-2" /> Export {reportType === "kitchen_s" ? "Kitchen" : "Product"} XLSX
        </Button>
      </div>
      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 font-bold">{reportType === "kitchen_s" ? "Item(s)" : "Product"}</th>
              <th className="font-bold">Customer</th>
              <th className="font-bold">Price</th>
              {reportType !== "kitchen_s" && <th className="font-bold">Selling Price</th>}
              <th className="font-bold">Qty</th>
              <th className="font-bold">Tax</th>
              <th className="font-bold">Discount</th>
              <th className="font-bold">Total</th>
              <th className="font-bold">Payment</th>
            </tr>
          </thead>
          <tbody>
            {flatProductRows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((item: FlatProductRow, i) => (
              <tr key={i} className="border-b">
                <td className="py-2">{item.name}</td>
                <td>{item.customer_name}</td>
                <td>{item.cost_price}</td>
                {reportType !== "kitchen_s" && <td>{item.selling_price}</td>}
                <td>{item.quantity}</td>
                <td>{item.tax}</td>
                <td>{item.discount}%</td>
                <td>₹{item.amount}</td>
                <td>{item.payment_method}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td colSpan={reportType === "kitchen_s" ? 6 : 7}>Total</td>
              <td>₹{totalProduct}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-end mt-4 gap-2">
        <Button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} size="sm">Previous</Button>
        <span className="text-sm px-2">Page {currentPage}</span>
        <Button disabled={(currentPage * ITEMS_PER_PAGE) >= flatProductRows.length} onClick={() => setCurrentPage(prev => prev + 1)} size="sm">Next</Button>
      </div>
    </div>
  )
}
