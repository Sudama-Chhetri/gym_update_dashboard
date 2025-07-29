import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'

interface Member {
  member_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface MemberDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  editData: Member | null;
}

export default function MemberDrawer({ open, onClose, onSave, editData }: MemberDrawerProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (editData) {
      setName(editData.name || '')
      setEmail(editData.email || '')
      setPhone(editData.phone || '')
      setAddress(editData.address || '')
    } else {
      setName('')
      setEmail('')
      setPhone('')
      setAddress('')
    }
  }, [editData])

  const handleSubmit = async () => {
    if (!name || !phone) return

    const updates = {
      name,
      email,
      phone,
      address,
    }

    if (editData) {
      const { error } = await supabase
        .from('members')
        .update(updates)
        .eq('member_id', editData.member_id)

      if (!error) {
        onSave()
        onClose()
      } else {
        console.error('Error updating member:', error)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) setPhone(e.target.value)
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <Button className="w-full" onClick={handleSubmit}>
            Update Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
