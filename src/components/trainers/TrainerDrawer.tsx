import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { addTrainer, updateTrainer } from '@/lib/supabase/trainer'

export default function TrainerDrawer({ open, onClose, onSave, editData }) {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    address: '',
    age: '',
    cost: '',
  })

  useEffect(() => {
    if (editData) {
      setForm({
        name: editData.name,
        contact: editData.contact,
        email: editData.email,
        address: editData.address,
        age: editData.age?.toString() || '',
        cost: editData.cost?.toString() || '',
      })
    } else {
      setForm({ name: '', contact: '', email: '', address: '', age: '', cost: '' })
    }
  }, [editData, open])

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      contact: form.contact,
      email: form.email,
      address: form.address,
      age: parseInt(form.age),
      cost: parseInt(form.cost),
    }

    if (editData) {
      await updateTrainer(editData.trainer_id, payload)
    } else {
      await addTrainer(payload)
    }

    onSave()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit Trainer' : 'Add a New Trainer'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {[
            { name: 'name' },
            { name: 'contact' },
            { name: 'email' },
            { name: 'address' },
            { name: 'age' },
            { name: 'cost' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1 capitalize">{field.name}</label>
              <Input
                type={['age', 'cost'].includes(field.name) ? 'number' : 'text'}
                placeholder={['age', 'cost'].includes(field.name) ? '0' : ''}
                min={['age', 'cost'].includes(field.name) ? 0 : undefined}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
              />
            </div>
          ))}
          <Button className="w-full" onClick={handleSubmit}>
            {editData ? 'Update' : 'Add'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
