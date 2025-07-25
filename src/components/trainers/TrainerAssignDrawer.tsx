'use client'

import { useEffect, useState } from 'react'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/supabaseClient'
import { format } from 'date-fns'

export default function TrainerAssignDrawer({ open, onClose, onSave, trainer }) {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchMembers = async () => {
      const { data, error } = await supabase.from('members').select('*')
      if (!error) setMembers(data || [])
    }
    if (open) fetchMembers()
  }, [open])

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  )

  const generateInvoiceId = () => {
    const rand = Math.floor(Math.random() * 900) + 100
    return `IN${Date.now().toString().slice(-4)}${rand}`
  }

  const handleAssign = async () => {
    if (!selectedMember || !trainer) return
    setLoading(true)

    const today = format(new Date(), 'yyyy-MM-dd')
    const invoiceId = generateInvoiceId()

    const { error: updateError } = await supabase
      .from('members')
      .update({
        trainer_assigned: trainer.name,
        trainer_assign_start_date: today,
        trainer_assign_end_date: null,
      })
      .eq('member_id', selectedMember.member_id)

    const { error: salesError } = await supabase.from('sales').insert({
      invoice_id: invoiceId,
      service_name: `Trainer Assignment - ${trainer.name}`,
      expenditure: 0,
      revenue: 0,
      profit: 0,
      quantity: 1,
      time_of_purchase: new Date(),
      mode_of_payment: paymentMethod,
    })

    if (!updateError && !salesError) {
      onSave?.()
      onClose()
    } else {
      alert('Error assigning trainer.')
    }

    setLoading(false)
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent className="p-6 space-y-4 max-w-lg mx-auto">
        <h2 className="text-xl font-bold">Assign Trainer</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search Member</label>
          <Input
            placeholder="Enter member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filteredMembers.length > 0 && (
            <div className="max-h-40 overflow-y-auto border rounded mt-1">
              {filteredMembers.map((member) => (
                <div
                  key={member.member_id}
                  onClick={() => {
                    setSelectedMember(member)
                    setSearch(member.name)
                  }}
                  className={`cursor-pointer px-3 py-2 hover:bg-muted ${
                    selectedMember?.member_id === member.member_id ? 'bg-muted' : ''
                  }`}
                >
                  {member.name}
                </div>
              ))}
            </div>
          )}

          {selectedMember && (
            <div className="border rounded p-3 space-y-1 bg-muted/50">
              <p>👤 <strong>{selectedMember.name}</strong></p>
              <p>📞 {selectedMember.phone}</p>
              <p>📧 {selectedMember.email}</p>
            </div>
          )}
        </div>

        {trainer && (
          <div className="mt-4 border rounded p-3 bg-muted/30">
            <p>Selected Trainer:</p>
            <p className="font-semibold">{trainer.name}</p>
          </div>
        )}

        <div className="pt-4">
          <label className="block mb-1">Mode of Payment</label>
          <select
            className="border px-3 py-2 rounded w-full"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option>Cash</option>
            <option>Card</option>
            <option>UPI</option>
          </select>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            disabled={!selectedMember || !trainer || loading}
            onClick={handleAssign}
          >
            {loading ? 'Assigning...' : 'Confirm Assignment'}
          </Button>
          <Button variant="ghost" onClick={onClose} className="text-red-500">
            Cancel
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
