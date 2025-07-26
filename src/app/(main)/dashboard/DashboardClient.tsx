"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
)

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { startOfDay, startOfMonth, startOfYear } from 'date-fns'

export default function DashboardClient() {
  const supabase = createClientComponentClient()

  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [filter, setFilter] = useState<'Day' | 'Month' | 'Year'>('Month')
  const [revenueChartData, setRevenueChartData] = useState({ labels: [], datasets: [] })
  const [members, setMembers] = useState([])
  const [memberCategoryData, setMemberCategoryData] = useState({ labels: [], datasets: [] })
  const [topTrainer, setTopTrainer] = useState<{ name: string; count: number } | null>(null)

  useEffect(() => {
    const now = new Date()
    let fromDate

    switch (filter) {
      case 'Day': fromDate = startOfDay(now); break
      case 'Month': fromDate = startOfMonth(now); break
      case 'Year': fromDate = startOfYear(now); break
    }

    const fetchDashboardData = async () => {
      const { data: salesData } = await supabase
        .from('sales')
        .select('amount_paid, time_of_purchase, payment_status, category, trainer_name, items_json, service_name')
        .gte('time_of_purchase', fromDate.toISOString())

      if (salesData) {
        const paidData = salesData.filter(row => row.payment_status === 'paid')
        setTotalTransactions(paidData.length)
        const total = paidData.reduce((sum, row) => sum + (row.amount_paid || 0), 0)
        setTotalRevenue(total)

        const chartLabels = paidData.map(d => new Date(d.time_of_purchase).toLocaleString())
        const chartValues = paidData.map(d => d.amount_paid)
        setRevenueChartData({
          labels: chartLabels,
          datasets: [{
            label: 'Revenue',
            data: chartValues,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            tension: 0.4,
          }],
        })

        // Member Distribution Chart (from sales with service_name = membership)
        const membershipData = paidData.filter(sale => sale.service_name?.toLowerCase().includes('membership'))
        const categoryCounts = membershipData.reduce((acc, sale) => {
          const cat = sale.category || 'Unknown'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})
        setMemberCategoryData({
          labels: Object.keys(categoryCounts),
          datasets: [{ label: 'Members Distribution', data: Object.values(categoryCounts), backgroundColor: '#60a5fa' }],
        })

        // Top Trainer
        const trainerCountMap = paidData.reduce((acc, row) => {
          if (row.trainer_name) acc[row.trainer_name] = (acc[row.trainer_name] || 0) + 1
          return acc
        }, {})
        const topTrainerEntry = Object.entries(trainerCountMap).sort((a, b) => b[1] - a[1])[0]
        if (topTrainerEntry) setTopTrainer({ name: topTrainerEntry[0], count: topTrainerEntry[1] })
      }
    }

    fetchDashboardData()
  }, [filter])


  useEffect(() => {
    const fetchMembers = async () => {
      const { data: membersData } = await supabase.from('members').select('*')
      if (membersData) setMembers(membersData)
    }
    fetchMembers()
  }, [])

  const activeMembers = members.filter(m => m.membership_status === 'active')
  const expiringSoon = members.filter(m => m.membership_status === 'expiring soon')
  const expiredMembers = members.filter(m => m.membership_status === 'expired')
  const newThisMonth = members.filter(m => new Date(m.join_date).getMonth() === new Date().getMonth()).length   

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₹${context.raw} on ${revenueChartData.labels[context.dataIndex]}`,
        },
      },
    },
    scales: {
      x: { display: false },
      y: { beginAtZero: true },
    },
  }

    return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div className="bg-gradient-to-br from-blue-50 to-white shadow-sm rounded-2xl p-6 col-span-1 md:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Total Sales Summary ({filter})</h2>
          <div className="space-x-2">
            {['Day', 'Month', 'Year'].map((f) => (
              <button
                key={f}
                className={`px-3 py-1 rounded ${filter === f ? 'bg-blue-500 text-white' : 'bg-blue-100'}`}
                onClick={() => setFilter(f as typeof filter)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-10 text-center">
          <div>
            <p className="text-2xl font-bold">💳 {totalTransactions}</p>
            <p className="text-muted-foreground">Transactions</p>
          </div>
          <div>
            <p className="text-2xl font-bold">₹{totalRevenue}</p>
            <p className="text-muted-foreground">Revenue</p>
          </div>
        </div>
        <div className="mt-6 h-[400px]">
          <Line data={revenueChartData} options={chartOptions} />
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">Member Stats</h2>
        <ul className="space-y-2">
          <li>👥 Total Members: {members.length}</li>
          <li>🆕 New This Month: {newThisMonth}</li>
          <li>✅ Active: {activeMembers.length}</li>
          <li>⚠️ Expiring Soon: {expiringSoon.length}</li>
          <li>⚠️ Expired: {expiredMembers.length}</li>
        </ul>
        <div className="mt-6">
          <h3 className="text-md font-semibold mb-2">Top Trainer</h3>
          {topTrainer ? (
            <>
              <p className="text-md font-bold">🏋️‍♂️ {topTrainer.name}</p>
              <p className="text-muted-foreground text-sm">{topTrainer.count} Assignments</p>
            </>
          ) : (
            <p className="text-sm">No trainer data</p>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 col-span-1 md:col-span-2">
        <h2 className="text-lg font-semibold mb-4">Members Distribution</h2>
        <div className="">
          {memberCategoryData.labels.length > 0 && (
            <Bar data={memberCategoryData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
          )}
        </div>
      </div>
    </div>
  )
}

