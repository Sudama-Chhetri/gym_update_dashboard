'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase/supabaseClient"
import toast from "react-hot-toast"
import MembershipInvoiceDrawer from "@/components/invoices/MembershipInvoiceDrawer"

const JOINING_FEE = 5000;

export default function MembershipPOS() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [joinDate, setJoinDate] = useState("")
  const [membershipPlans, setMembershipPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [categoryOptions, setCategoryOptions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [filteredPlans, setFilteredPlans] = useState([])

  const searchParams = useSearchParams()
  const memberId = searchParams.get("member_id")
  const [existingMember, setExistingMember] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: plans } = await supabase.from("membership").select("*")
      if (plans) {
        setMembershipPlans(plans)
        const uniqueCategories = [...new Set(plans.map(p => p.category))]
        setCategoryOptions(uniqueCategories)
      }

      if (memberId) {
        const { data: member } = await supabase
          .from("members")
          .select("*")
          .eq("member_id", memberId)
          .single()

        if (member) {
          setExistingMember(member)
          setName(member.name || "")
          setEmail(member.email || "")
          setPhone(member.phone || "")
          setAddress(member.address || "")
          setJoinDate(new Date().toISOString().split("T")[0])
        }
      }
    }

    fetchData()
  }, [memberId])

  const handleSubmit = async () => {
    if (!name || !phone || !selectedPlan || !joinDate) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLoading(true)

    try {
      const today = new Date(joinDate)
      const duration = parseInt(selectedPlan.duration)
      let endDate = new Date(today)

      if (existingMember && new Date(existingMember.membership_end) > today) {
        endDate = new Date(existingMember.membership_end)
        endDate.setMonth(endDate.getMonth() + duration)
      } else {
        endDate.setMonth(endDate.getMonth() + duration)
      }

      const invoiceId = `IN${String((Math.random() * 1000000).toFixed(0)).padStart(6, "0")}`
      const isNewMember = !existingMember
      const joiningFee = isNewMember ? JOINING_FEE : 0
      const membershipPrice = selectedPlan?.pricing || 0
      const amountPaid = membershipPrice + joiningFee

      let memberIdToUse = memberId

      if (existingMember) {
        await supabase.from("members").update({
          membership_start: today.toISOString(),
          membership_end: endDate.toISOString(),
          membership_status: duration <= 1 ? "expiring soon" : "active"
        }).eq("member_id", existingMember.member_id)
      } else {
        const { data: allMembers } = await supabase.from("members").select("member_id")
        const newId = `M${String((allMembers?.length || 0) + 1).padStart(3, "0")}`
        memberIdToUse = newId

        await supabase.from("members").insert([{
          member_id: newId,
          name,
          email,
          phone,
          address,
          join_date: today.toISOString(),
          membership_start: today.toISOString(),
          membership_end: endDate.toISOString(),
          membership_status: duration <= 1 ? "expiring soon" : "active"
        }])
      }

      const { error } = await supabase.from("sales").insert([{
        invoice_id: invoiceId,
        service_name: "Membership",
        member_name: name,
        member_phone: phone,
        membership_type: `${selectedPlan.duration} months`,
        membership_start_date: today.toISOString(),
        membership_end_date: endDate.toISOString(),
        amount_paid: amountPaid,
        category: selectedPlan.category,
        quantity: 1,
        payment_method: paymentMethod,
        payment_status: "paid",
        time_of_purchase: today.toISOString(),
      }])

      if (error) {
        console.error("❌ Sales Insert Error:", error.message)
        toast.error("Sales entry failed.")
        return
      }

      setInvoiceData({
        invoice_id: invoiceId,
        customerName: name,
        customerPhone: phone,
        joinDate: existingMember?.join_date || today.toISOString(),
        plan: `${selectedPlan.duration} month${selectedPlan.duration > 1 ? "s" : ""}`,
        paymentMethod,
        amountPaid,
        date: today.toISOString(),
        showJoiningFee: isNewMember,
        joiningFee,
        startDate: today.toISOString(),
        endDate: endDate.toISOString(),
        category: selectedPlan.category,
        isMembership: true,
      })


      setInvoiceOpen(true)
      toast.success("Membership processed successfully")

      // Reset form
      setName("")
      setEmail("")
      setPhone("")
      setAddress("")
      setSelectedPlan(null)
      setJoinDate("")
    } catch (err) {
      console.error("❌ Unexpected Error:", err)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Sell Membership</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Customer Name" value={name} onChange={(e) => setName(e.target.value)} className="border rounded p-2 w-full" />
        <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => /^\d*$/.test(e.target.value) && setPhone(e.target.value)} className="border rounded p-2 w-full" />
        <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="border rounded p-2 w-full" />
        <input type="text" placeholder="Address (optional)" value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded p-2 w-full" />
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date</label>
          <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} className="border rounded p-2 w-full" />
        </div>
      </div>

      <div className="mt-6">
        <label className="block font-medium mb-1">Select Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            const selected = e.target.value
            setSelectedCategory(selected)
            const filtered = membershipPlans.filter(p => p.category === selected)
            setFilteredPlans(filtered)
            setSelectedPlan(null)
          }}
          className="border px-3 py-2 rounded w-full md:w-1/2"
        >
          <option value="">-- Select Category --</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <h3 className="font-medium mb-2">Choose a Plan:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`border rounded p-3 transition-colors duration-150 hover:bg-blue-50 hover:border-blue-400 ${selectedPlan?.id === plan.id ? "border-blue-500 bg-blue-100" : ""}`}
            >
              {plan.duration} Months – ₹{plan.pricing}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="block font-medium mb-1">Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="cash">Cash</option>
          <option value="card">Card</option>
          <option value="upi">UPI</option>
        </select>
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-lg font-medium">
          Total: ₹
          {selectedPlan
            ? selectedPlan.pricing + (!existingMember ? JOINING_FEE : 0)
            : 0}
        </div>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          {isLoading ? "Processing..." : "Generate Invoice"}
        </button>
      </div>

      <MembershipInvoiceDrawer
        open={invoiceOpen}
        onClose={() => setInvoiceOpen(false)}
        invoiceData={invoiceData}
        usePDF
      />
    </div>
  )
}
