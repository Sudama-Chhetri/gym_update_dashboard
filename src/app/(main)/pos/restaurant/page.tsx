"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import FoodInvoiceDrawer from "@/components/invoices/FoodInvoiceDrawer"
import { format } from "date-fns"

export default function RestaurantPOSPage() {
  const [foodItems, setFoodItems] = useState([])
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [members, setMembers] = useState([])
  const [invoiceData, setInvoiceData] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const ITEMS_PER_PAGE = 6

  useEffect(() => {
    const fetchData = async () => {
      const { data: food } = await supabase.from("food").select("*")
      setFoodItems(food || [])

      const { data: members } = await supabase.from("members").select("name, phone")
      setMembers(members || [])
    }
    fetchData()
  }, [])

  const filteredItems = foodItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const addToCart = (item) => {
    setCart((prev) => {
      const found = prev.find((f) => f.food_id === item.food_id)
      return found
        ? prev.map((f) =>
            f.food_id === item.food_id ? { ...f, quantity: f.quantity + 1 } : f
          )
        : [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (item) => {
    setCart((prev) =>
      prev.reduce((acc, f) => {
        if (f.food_id === item.food_id) {
          const newQty = f.quantity - 1
          if (newQty > 0) acc.push({ ...f, quantity: newQty })
        } else acc.push(f)
        return acc
      }, [])
    )
  }

  const total = cart.reduce((acc, item) => acc + item.cost * item.quantity, 0)
  const discountedTotal = total - total * (parseFloat(discount) / 100)

  const handleGenerateInvoice = async () => {
    if (!paymentMethod || cart.length === 0) {
      alert("Please select a payment method and add at least one item to cart.")
      return
    }

    const invoiceId = `IN${Date.now().toString().slice(-6)}`
    const istNow = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    const isoIST = new Date(istNow).toISOString()
    const displayDate = format(new Date(istNow), "dd MMM yyyy")

    const totalQuantity = cart.reduce((acc, i) => acc + i.quantity, 0)

    await supabase.from("sales").insert({
      invoice_id: invoiceId,
      service_name: "Restaurant Sale",
      quantity: totalQuantity,
      amount_paid: parseFloat(discountedTotal.toFixed(2)),
      member_name: customerName,
      member_phone: customerPhone,
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'Due' ? 'unpaid' : 'paid',
      time_of_purchase: isoIST,
      items_json: cart,
      discount: parseFloat(discount),
      category: "restaurant"
    })

    setInvoiceData({
      invoice_id: invoiceId,
      items: cart,
      total,
      discount,
      discountedTotal,
      customerName,
      customerPhone,
      paymentMethod,
      date: displayDate
    })

    setDrawerOpen(true)
    setCart([])
  }

  const handleNameChange = (val) => {
    setCustomerName(val)
    const match = members.find((m) => m.name.toLowerCase() === val.toLowerCase())
    if (match) setCustomerPhone(match.phone)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      <div className="md:w-2/3">
        <Input
          placeholder="Search food"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-4">
          {paginatedItems.map((item) => (
            <div
              key={item.food_id}
              className="border p-3 rounded shadow text-center"
            >
              <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
              <p className="text-sm">₹{item.cost}</p>
              <div className="flex justify-center gap-2 mt-2">
                <Button onClick={() => removeFromCart(item)}>-</Button>
                <Button onClick={() => addToCart(item)}>+</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4 justify-center">
          <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</Button>
          <Button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * ITEMS_PER_PAGE >= filteredItems.length}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="md:w-1/3 border p-4 rounded shadow">
        <Input
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => handleNameChange(e.target.value)}
          className="mb-2"
        />
        <Input
          placeholder="Contact"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          className="mb-2"
        />
        <div className="mb-2">
          <label className="text-sm font-medium mb-1 block">Payment Method</label>
          <select
            className="w-full border px-3 py-2 rounded"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="">Select</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="UPI">UPI</option>
            <option value="Due">Due</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium whitespace-nowrap">Discount %:</label>
          <Input
            type="number"
            step="0.01"
            min={0}
            className="w-full"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Cart</h3>
          {cart.map((item) => (
            <div key={item.food_id} className="text-sm mb-2">
              <p>{item.name} x {item.quantity}</p>
              <p>₹{item.cost} each</p>
            </div>
          ))}
          <p className="font-bold mt-2">Total: ₹{discountedTotal.toFixed(2)}</p>
          <Button className="mt-4 w-full" onClick={handleGenerateInvoice} disabled={cart.length === 0}>
            Generate Invoice
          </Button>
        </div>
      </div>

      {invoiceData && (
        <FoodInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={invoiceData}
        />
      )}
    </div>
  )
}
