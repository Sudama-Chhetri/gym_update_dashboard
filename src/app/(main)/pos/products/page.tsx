"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductInvoiceDrawer from "@/components/invoices/ProductInvoiceDrawer"
import { format } from "date-fns"

interface Product {
  product_id: string;
  name: string;
  selling_price: number;
  cost_price: number;
  stock: number;
  mrp: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Member {
  name: string;
  phone: string;
}

interface InvoiceData {
  invoice_id: string;
  items: CartItem[];
  total: number;
  discount: number;
  discountedTotal: number;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  date: string;
}

export default function ProductPOSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [members, setMembers] = useState<Member[]>([])
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const PRODUCTS_PER_PAGE = 6

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from("products").select("*")
      setProducts(data || [])
    }

    const fetchMembers = async () => {
      const { data } = await supabase.from("members").select("name, phone")
      setMembers(data || [])
    }

    fetchProducts()
    fetchMembers()
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.product_id === product.product_id)
      if (!found) {
        return [...prev, { ...product, quantity: 1 }]
      } else {
        return prev.map((item) => {
          if (item.product_id === product.product_id && item.quantity < product.stock) {
            return { ...item, quantity: item.quantity + 1 }
          }
          return item
        })
      }
    })
  }

  const removeFromCart = (product: Product) => {
    setCart((prev) =>
      prev.reduce((acc: CartItem[], item) => {
        if (item.product_id === product.product_id) {
          const newQuantity = item.quantity - 1
          if (newQuantity > 0) {
            acc.push({ ...item, quantity: newQuantity })
          }
        } else {
          acc.push(item)
        }
        return acc
      }, [])
    )
  }

  const total = cart.reduce(
    (acc, item) => acc + item.selling_price * item.quantity,
    0
  )
  const discountedTotal = total - total * (discount / 100)

  const handleGenerateInvoice = async () => {
    if (!paymentMethod || cart.length === 0) {
      alert("Please select a payment method and add at least one item to cart.")
      return
    }

    const invoiceId = `IN${Date.now().toString().slice(-6)}`
    const date = format(new Date(), "dd MMM yyyy, hh:mm a")

    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0)

    await supabase.from("sales").insert([{
    invoice_id: invoiceId,
    service_name: "Product Purchase",
    quantity: totalQuantity,
    member_name: customerName,
    member_phone: customerPhone,
    payment_method: paymentMethod,
    payment_status: paymentMethod === 'Due' ? 'unpaid' : 'paid',
    time_of_purchase: new Date().toISOString(),
    items_json: cart,
    amount_paid: discountedTotal,
    discount: discount,
  }])

    await Promise.all(
      cart.map((item) =>
        supabase
          .from("products")
          .update({ stock: item.stock - item.quantity })
          .eq("product_id", item.product_id)
      )
    )

    setInvoiceData({
      invoice_id: invoiceId,
      items: cart,
      total,
      discount,
      discountedTotal,
      customerName,
      customerPhone,
      paymentMethod,
      date,
    })
    setDrawerOpen(true)
    setCart([])
  }

  const handleNameChange = (val: string) => {
    setCustomerName(val)
    const match = members.find((m) => m.name.toLowerCase() === val.toLowerCase())
    if (match) setCustomerPhone(match.phone)
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* Left */}
      <div className="md:w-2/3">
        <Input
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-4">
          {paginatedProducts.map((product) => (
            <div
              key={product.product_id}
              className="border p-3 rounded shadow flex flex-col text-center"
            >
              <h4 className="font-semibold text-sm mb-1">{product.name}</h4>
              <p className="text-sm">₹{product.selling_price}</p>
              <p className="text-xs text-muted-foreground mb-1">
                {product.stock === 0 ? "Out of stock" : `Stock: ${product.stock}`}
              </p>
              <div className="flex justify-center gap-2 mt-2">
                <Button onClick={() => removeFromCart(product)} disabled={product.stock === 0}>-</Button>
                <Button onClick={() => addToCart(product)} disabled={product.stock === 0}>+</Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4 justify-center">
          <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            Prev
          </Button>
          <Button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage * PRODUCTS_PER_PAGE >= filteredProducts.length}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Right */}
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
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
          />
        </div>

        <div className="border-t pt-4 mt-4">
          <h3 className="font-semibold mb-2">Cart</h3>
          {cart.map((item) => (
            <div key={item.product_id} className="text-sm mb-2">
              <p>{item.name} x {item.quantity}</p>
              <p>₹{item.selling_price} each (MRP: ₹{item.mrp})</p>
            </div>
          ))}
          <p className="font-bold mt-2">Total: ₹{discountedTotal.toFixed(2)}</p>
          <Button
            className="mt-4 w-full"
            onClick={handleGenerateInvoice}
            disabled={cart.length === 0}
          >
            Generate Invoice
          </Button>
        </div>
      </div>

      {invoiceData && (
        <ProductInvoiceDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          invoiceData={invoiceData}
        />
      )}
    </div>
  )
}
