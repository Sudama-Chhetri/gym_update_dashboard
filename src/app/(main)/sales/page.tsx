"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Button } from "@/components/ui/button"
import MembershipInvoiceDrawer from "@/components/invoices/MembershipInvoiceDrawer"
import TrainerInvoiceDrawer from "@/components/invoices/TrainerInvoiceDrawer"
import FoodInvoiceDrawer from "@/components/invoices/FoodInvoiceDrawer"
import ProductInvoiceDrawer from "@/components/invoices/ProductInvoiceDrawer"
import { Input } from "@/components/ui/input"

export default function SalesPage() {
  const [sales, setSales] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [payInvoiceId, setPayInvoiceId] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash")
  const [currentPage, setCurrentPage] = useState(1)
  const [serviceFilter, setServiceFilter] = useState("All")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("All")
  const itemsPerPage = 8

  useEffect(() => {
    const fetchSales = async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .order("time_of_purchase", { ascending: false })

      if (!error && data) setSales(data)
    }
    fetchSales()
  }, [])

  const handleViewInvoice = (sale) => {
    const common = {
      invoice_id: sale.invoice_id,
      paymentMethod: sale.payment_method || "-",
      date: new Date(sale.time_of_purchase).toLocaleString("en-IN", {
         day: "2-digit",
        month: "short",
        year: "numeric",
    })}

    switch (sale.service_name) {
      case "Membership":
      const toDate = (str) => new Date(str).toISOString().split("T")[0]
      const isRenewal = toDate(sale.time_of_purchase) !== toDate(sale.membership_start_date)

      setSelectedInvoice({
        ...common,
        customerName: sale.member_name,
        customerPhone: sale.member_phone,
        category: sale.category,
        plan: sale.membership_type,
        startDate: sale.membership_start_date,
        endDate: sale.membership_end_date,
        amountPaid: sale.amount_paid,
        joinDate: sale.membership_start_date,
        isMembership: true,
        showJoiningFee: !isRenewal,
      })
      break;

      case "Trainer Assignment":
      setSelectedInvoice({
        ...common,
        customerName: sale.member_name,
        customerPhone: sale.member_phone,
        trainerName: sale.trainer_name,
        assignStart: new Date(sale.assign_start).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        assignEnd: new Date(sale.assign_end).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
        paymentMethod: sale.payment_method || "-",
        total: sale.amount_paid,
        isTrainer: true,
      });
      break;

      case "Restaurant Sale":
        setSelectedInvoice({
          ...common,
          items: sale.items_json || [],
          total: sale.amount_paid + (sale.discount || 0),
          discount: sale.discount || 0,
          discountedTotal: sale.amount_paid,
          customerName: sale.member_name,
          customerPhone: sale.member_phone,
          isRestaurant: true,
        })
        break

      case "Product Purchase":
      default:
        setSelectedInvoice({
          ...common,
          items: sale.items_json || [],
          total: sale.amount_paid + (sale.discount || 0),
          discount: sale.discount || 0,
          discountedTotal: sale.amount_paid,
          customerName: sale.member_name,
          customerPhone: sale.member_phone,
          isProduct: true,
        })
        break
    }

    setDrawerOpen(true)
  }

  const handleMarkAsPaid = async (invoiceId, newMethod) => {
    const { error } = await supabase
      .from("sales")
      .update({
        payment_status: "paid",
        payment_method: newMethod,
      })
      .eq("invoice_id", invoiceId);

    if (error) {
      alert("❌ Failed to update payment status");
      return;
    }

    const { data } = await supabase
      .from("sales")
      .select("*")
      .order("time_of_purchase", { ascending: false });

    setSales(data);
    setPayInvoiceId(null); // close modal
    alert("✅ Payment marked as paid");
  };

  return (
    <div className="p-6">
     <div className="flex flex-wrap items-center gap-4 mb-4">
      <Input
        placeholder="Search by Invoice ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-xs"
      />

      <select
        value={serviceFilter}
        onChange={(e) => setServiceFilter(e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="All">All Services</option>
        <option value="Membership">Membership</option>
        <option value="Trainer Assignment">Trainer Assignment</option>
        <option value="Restaurant Sale">Restaurant Sale</option>
        <option value="Product Purchase">Product Purchase</option>
      </select>

      <select
        value={paymentStatusFilter}
        onChange={(e) => setPaymentStatusFilter(e.target.value)}
        className="border px-3 py-2 rounded text-sm"
      >
        <option value="All">All Status</option>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>
    </div>


      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Invoice ID</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Amount Paid</th>
              <th className="p-2 border">Payment Method</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {sales
              .filter((s) =>
              s.invoice_id.toLowerCase().includes(search.toLowerCase()) &&
              (serviceFilter === "All" || s.service_name === serviceFilter) &&
              (paymentStatusFilter === "All" || s.payment_status === paymentStatusFilter)
            )
              .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
              .map((sale) => (
                <tr key={sale.invoice_id} className="text-sm">
                  <td className="p-2 border">{sale.invoice_id}</td>
                  <td className="p-2 border">{sale.service_name}</td>
                  <td className="p-2 border">
                    ₹{(sale.amount_paid ?? sale.revenue)?.toLocaleString("en-IN")}
                  </td>
                  <td className="p-2 border">{sale.payment_method || "-"}</td>
                  <td
                    className={`p-2 border font-semibold ${
                      sale.payment_status === "unpaid"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {sale.payment_status === "unpaid" ? "Unpaid" : "Paid"}
                  </td>
                  <td className="p-2 border">
                  {new Date(sale.time_of_purchase).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>

                  <td className="p-2 border space-x-2">
                    <Button onClick={() => handleViewInvoice(sale)}>View</Button>
                    {sale.payment_status === "unpaid" && (
                      <Button
                        className="bg-green-600 text-white hover:bg-green-700"
                        onClick={() => {
                          setPayInvoiceId(sale.invoice_id)
                          setSelectedPaymentMethod("Cash")
                        }}
                      >
                        Pay
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <div className="flex justify-center items-center gap-4 mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </Button>

        <span className="text-sm">
          Page {currentPage} of {Math.ceil(sales.filter((s) =>
            s.invoice_id.toLowerCase().includes(search.toLowerCase())
          ).length / itemsPerPage)}
        </span>

        <Button
          variant="outline"
          disabled={
            currentPage ===
            Math.ceil(
              sales.filter((s) =>
                s.invoice_id.toLowerCase().includes(search.toLowerCase())
              ).length / itemsPerPage
            )
          }
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      </div>

      {payInvoiceId && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-5 rounded-md shadow-lg w-[320px] space-y-4">
          <h3 className="text-lg font-semibold">Select Payment Method</h3>
          <select
            value={selectedPaymentMethod}
            onChange={(e) => {
              setSelectedPaymentMethod(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPayInvoiceId(null)}>Cancel</Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleMarkAsPaid(payInvoiceId, selectedPaymentMethod)}
            >
              Confirm Payment
            </Button>
          </div>
        </div>
      </div>
    )}

      {selectedInvoice?.isMembership && (
        <MembershipInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={selectedInvoice}
        />
      )}
      {selectedInvoice?.isTrainer && (
        <TrainerInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={selectedInvoice}
        />
      )}
      {selectedInvoice?.isRestaurant && (
        <FoodInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={selectedInvoice}
        />
      )}
      {selectedInvoice?.isProduct && (
        <ProductInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={selectedInvoice}
        />
      )}
    </div>
  )
}
