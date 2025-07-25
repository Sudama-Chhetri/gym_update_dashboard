'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react'
import ExpensesDrawer from '@/components/expenses/ExpensesDrawer'
import { supabase } from '@/lib/supabase/supabaseClient'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [editData, setEditData] = useState(null)

  const fetchExpenses = async () => {
    const { data, error } = await supabase.from('expenses').select('*')
    if (!error && data) {
      setExpenses(data)
      setFiltered(data)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  useEffect(() => {
    let temp = [...expenses]

    if (search.trim()) {
      temp = temp.filter((exp) =>
        exp.name.toLowerCase().includes(search.toLowerCase()) ||
        exp.expense_id?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (sortKey) {
      temp.sort((a, b) => {
        if (sortOrder === 'asc') return a[sortKey] > b[sortKey] ? 1 : -1
        else return a[sortKey] < b[sortKey] ? 1 : -1
      })
    }

    setFiltered(temp)
    setPage(1)
  }, [search, sortKey, sortOrder, expenses])

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    await supabase.from('expenses').delete().eq('expense_id', id)
    fetchExpenses()
  }

  const SortIcon = ({ column }: { column: string }) => (
    sortKey === column
      ? (sortOrder === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />)
      : null
  )

  const paginated = filtered.slice((page - 1) * 10, page * 10)
  const totalPages = Math.ceil(filtered.length / 10)

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Expenses</h1>
        <Button onClick={() => { setEditData(null); setOpenDrawer(true); }}>
          <Plus className="mr-2" /> Add Expense
        </Button>
      </div>

      <Input
        type="text"
        placeholder="Search by ID or Name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('amount')}>
                Amount <SortIcon column="amount" />
              </th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Dept.</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((exp) => (
              <tr key={exp.expense_id} className="border-t">
                <td className="p-2">{exp.expense_id}</td>
                <td className="p-2">{exp.name}</td>
                <td className="p-2">₹{exp.amount}</td>
                <td className="p-2">{exp.date_of_expense}</td>
                <td className="p-2">{exp.type_of_expense}</td>
                <td className="p-2">{exp.department}</td>
                <td className="p-2 space-x-2">
                  <Button size="sm" onClick={() => { setEditData(exp); setOpenDrawer(true); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(exp.expense_id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={16} /></Button>
          <Button size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={16} /></Button>
        </div>
      </div>

      <ExpensesDrawer
        open={openDrawer}
        onClose={() => { setEditData(null); setOpenDrawer(false); }}
        onSubmit={(data) => {
          if (editData) {
            supabase.from('expenses').update(data).eq('expense_id', editData.expense_id).then(fetchExpenses)
          } else {
            const newId = `EX${Math.floor(1000 + Math.random() * 9000)}`
            supabase.from('expenses').insert({ ...data, expense_id: newId }).then((res) => {
    console.log('Insert result:', res)
    fetchExpenses()
  })
          }
          setOpenDrawer(false)
          setEditData(null)
        }}
        initialData={editData}
      />
    </div>
  )
}
