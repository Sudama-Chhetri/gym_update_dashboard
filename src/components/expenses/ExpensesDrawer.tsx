'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'

export default function ExpensesDrawer({ open, onClose, onSubmit, initialData }) {
  const isEdit = Boolean(initialData)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dateOfExpense, setDateOfExpense] = useState('')
  const [typeOfExpense, setTypeOfExpense] = useState('')
  const [department, setDepartment] = useState('')

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '')
      setAmount(initialData.amount?.toString() || '')
      setDateOfExpense(initialData.date_of_expense || '')
      setTypeOfExpense(initialData.type_of_expense || '')
      setDepartment(initialData.department || '')
    } else {
      setName('')
      setAmount('')
      setDateOfExpense('')
      setTypeOfExpense('')
      setDepartment('')
    }
  }, [initialData, open])

  const handleSubmit = () => {
    if (Number(amount) < 0) return alert("Amount can't be negative")
    onSubmit({
      name,
      amount: parseFloat(amount),
      date_of_expense: dateOfExpense,
      type_of_expense: typeOfExpense,
      department,
    })
    onClose()
  }

  const renderDepartmentInput = () => {
    if (typeOfExpense === 'gym') {
      return (
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select department</option>
          <option value="personal">Personal</option>
          <option value="electricity">Electricity</option>
          <option value="gym equipment">Gym Equipment</option>
          <option value="water bill">Water Bill</option>
          <option value="maintenance">Maintenance</option>
        </select>
      )
    } else if (typeOfExpense === 'kitchen') {
      return (
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select department</option>
          <option value="utensils">Utensils</option>
          <option value="groceries">Groceries</option>
        </select>
      )
    } else if (typeOfExpense === 'other expense') {
      return (
        <Input
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          placeholder="Enter specific department"
        />
      )
    } else {
      return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Expense Record' : 'Add Expense Record'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Date of Expense</Label>
            <Input
              type="date"
              value={dateOfExpense}
              onChange={(e) => setDateOfExpense(e.target.value)}
            />
          </div>

          <div>
            <Label>Type of Expense</Label>
            <select
              value={typeOfExpense}
              onChange={(e) => setTypeOfExpense(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="gym">Gym</option>
              <option value="kitchen">Kitchen</option>
              <option value="other expense">Other Expense</option>
            </select>
          </div>

          <div>
            <Label>Department</Label>
            {renderDepartmentInput()}
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSubmit}>
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
