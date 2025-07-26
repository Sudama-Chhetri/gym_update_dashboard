'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import TrainerInvoiceDrawer from '@/components/invoices/TrainerInvoiceDrawer'
import { useSearchParams } from 'next/navigation'


export default function TrainerPOSPage() {
  const [trainers, setTrainers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedTrainer, setSelectedTrainer] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [loading, setLoading] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceData, setInvoiceData] = useState(null)
  const [assignDate, setAssignDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const searchParams = useSearchParams()
  const prefillMemberId = searchParams.get("member_id")

  useEffect(() => {
    const fetchPrefillMember = async () => {
      if (!prefillMemberId) return

      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("member_id", prefillMemberId)
        .single()

      if (!error && data) {
        setSelectedMember(data)
        setSearchQuery(data.name)
      }
    }

    fetchPrefillMember()
  }, [prefillMemberId])

  useEffect(() => {
    const fetchTrainers = async () => {
      const { data: t } = await supabase.from('trainers').select('*')
      setTrainers(t || [])
    }
    fetchTrainers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSelectedMember(null)
      setSuggestions([])
    }
  }, [searchQuery])

  const handleSearch = async (query) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSuggestions([])
      return
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('name', `%${query}%`)

    if (!error) setSuggestions(data || [])
  }

  const generateInvoiceId = () => {
    const rand = Math.floor(Math.random() * 900) + 100
    return `IN${Date.now().toString().slice(-4)}${rand}`
  }

  const handleSubmit = async () => {
  if (!selectedMember || !selectedTrainer) return

  setLoading(true)

  const invoiceId = generateInvoiceId()
  const trainerCost = selectedTrainer.cost || 0

  const startDate = new Date(assignDate)  // ← from date input
  const months = 1// e.g., 1 from "1 month"
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + months)

  await supabase
  .from('members')
  .update({
    trainer_assigned: selectedTrainer.trainer_id,
    trainer_assign_start_date: startDate,  // <-- from date picker
    trainer_assign_end_date: endDate       // <-- calculated from duration
  })
  .eq('member_id', selectedMember.member_id)

    await supabase.from("sales").insert({
    invoice_id: invoiceId,
    service_name: "Trainer Assignment",
    payment_method: paymentMethod,
    member_name: selectedMember.name,
    member_phone: selectedMember.phone,
    trainer_name: selectedTrainer.name,
    assign_start: startDate.toISOString(),
    assign_end: endDate.toISOString(),
    time_of_purchase: new Date().toISOString(),
    amount_paid: trainerCost,
  })

  setInvoiceData({
  invoice_id: invoiceId,
  date: new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }),
  customerName: selectedMember.name,
  customerPhone: selectedMember.phone,
  trainerName: selectedTrainer.name,
  assignStart: format(startDate, "dd MMM yyyy"),
  assignEnd: format(endDate, "dd MMM yyyy"),
  paymentMethod: paymentMethod,
  total: trainerCost
})

  setShowInvoice(true)

  setSelectedTrainer(null)
  setSelectedMember(null)
  setSearchQuery('')
  setSuggestions([])
  setLoading(false)
}

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Assign Trainer</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="relative">
          <Input
            placeholder="Customer Name"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {suggestions.length > 0 && !selectedMember && (
            <div className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
              {suggestions.map((member) => (
                <div
                  key={member.member_id}
                  onClick={() => {
                    setSelectedMember(member)
                    setSearchQuery(member.name)
                    setSuggestions([])
                  }}
                  className="px-3 py-2 cursor-pointer hover:bg-muted"
                >
                  {member.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <Input
          placeholder="Phone Number"
          value={selectedMember?.phone || ''}
          readOnly
        />
        <Input
          placeholder="Email (optional)"
          value={selectedMember?.email || ''}
          readOnly
        />
        <Input
          placeholder="Address (optional)"
          value={selectedMember?.address || ''}
          readOnly
        />
      </div>

      <h2 className="text-lg font-medium mt-6 mb-2">Choose a Trainer:</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {trainers.map((trainer) => (
          <div
            key={trainer.trainer_id}
            onClick={() => setSelectedTrainer(trainer)}
            className={`border rounded p-3 cursor-pointer text-center ${
              selectedTrainer?.trainer_id === trainer.trainer_id
                ? 'bg-blue-100 border-blue-500'
                : 'hover:bg-muted'
            }`}
          >
            <p className="font-medium">{trainer.name}</p>
            <p className="text-sm text-muted-foreground">
              ₹{trainer.cost || 0}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Payment Method:</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border px-3 py-2 rounded w-full max-w-sm"
        >
          <option>Cash</option>
          <option>Card</option>
          <option>UPI</option>
        </select>
      </div>

      <div className="mb-4">
      <label className="block font-medium mb-1">Assign Start Date:</label>
      <Input
        type="date"
        value={assignDate}
        onChange={(e) => setAssignDate(e.target.value)}
        className="w-full max-w-sm"
      />
      </div>

      <p className="text-lg font-semibold mb-4">
        Total: ₹{selectedTrainer?.cost || 0}
      </p>

      <Button
        onClick={handleSubmit}
        disabled={loading || !selectedTrainer || !selectedMember}
      >
        {loading ? 'Processing...' : 'Generate Invoice'}
      </Button>

      {showInvoice && invoiceData && (
        <TrainerInvoiceDrawer
          open={showInvoice}
          onClose={() => setShowInvoice(false)}
          invoiceData={invoiceData}
        />
      )}
    </div>
  )
}
