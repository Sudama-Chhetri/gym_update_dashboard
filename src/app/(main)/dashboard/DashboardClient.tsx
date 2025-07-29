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
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Line, Bar, Pie } from 'react-chartjs-2'
import { TooltipItem } from 'chart.js'

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
  ChartDataLabels,
)

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { startOfDay, startOfMonth, startOfYear, format } from 'date-fns'

export default function DashboardClient() {
  const supabase = createClientComponentClient()

  const [totalTransactions, setTotalTransactions] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [filter, setFilter] = useState<'Day' | 'Month' | 'Year'>('Month')
  interface ChartData {
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor: string | string[]; borderColor?: string; tension?: number; }[];
}

  const [revenueChartData, setRevenueChartData] = useState<ChartData>({ labels: [], datasets: [] })
  const [members, setMembers] = useState<Member[] | []>([])
  const [memberCategoryData, setMemberCategoryData] = useState<ChartData>({ labels: [], datasets: [] })
  const [topTrainer, setTopTrainer] = useState<{ name: string; count: number } | null>(null)
  const [salesByCategoryData, setSalesByCategoryData] = useState<ChartData>({ labels: [], datasets: [] })
  const [paymentMethodData, setPaymentMethodData] = useState<ChartData>({ labels: [], datasets: [] })
  const [newMembersChartData, setNewMembersChartData] = useState<ChartData>({ labels: [], datasets: [] })

  interface Member {
    membership_status: string;
    join_date: string;
    // Add other properties of a member if they are used elsewhere
  }

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
        .select('amount_paid, time_of_purchase, payment_status, category, trainer_name, items_json, service_name, payment_method')
        .gte('time_of_purchase', fromDate.toISOString())

      if (salesData) {
        const paidData = salesData.filter(row => row.payment_status === 'paid')
        setTotalTransactions(paidData.length)
        const total = paidData.reduce((sum, row) => sum + (row.amount_paid || 0), 0)
        setTotalRevenue(total)

        const aggregatedData: { [key: string]: number } = {};
        paidData.forEach(d => {
          const date = new Date(d.time_of_purchase);
          let label;
          switch (filter) {
            case 'Day': label = format(date, 'HH:00'); break;
            case 'Month': label = format(date, 'MMM dd'); break;
            case 'Year': label = format(date, 'MMM yyyy'); break;
          }
          aggregatedData[label] = (aggregatedData[label] || 0) + (d.amount_paid || 0);
        });

        const chartLabels = Object.keys(aggregatedData).sort();
        const chartValues = chartLabels.map(label => aggregatedData[label]);
        setRevenueChartData({
          labels: chartLabels,
          datasets: [{
            label: 'Revenue',
            data: chartValues,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            tension: 0.4,
          }],
        })

        // Member Distribution Chart (from sales with service_name = membership)
        const membershipData = paidData.filter(sale => sale.service_name?.toLowerCase().includes('membership'))
        const categoryCounts = membershipData.reduce((acc: { [key: string]: number }, sale) => {
          const cat = sale.category || 'Unknown'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {})
        setMemberCategoryData({
          labels: Object.keys(categoryCounts),
          datasets: [{ label: 'Members Distribution', data: Object.values(categoryCounts), backgroundColor: '#60a5fa' }],
        })

        // Top Trainer
        const trainerCountMap = paidData.reduce((acc: { [key: string]: number }, row) => {
          if (row.trainer_name) acc[row.trainer_name] = (acc[row.trainer_name] || 0) + 1
          return acc
        }, {})
        const topTrainerEntry = Object.entries(trainerCountMap).sort((a, b) => b[1] - a[1])[0]
        if (topTrainerEntry) setTopTrainer({ name: topTrainerEntry[0], count: topTrainerEntry[1] })

        // Sales by Service Category
        const salesByCategoryMap = paidData.reduce((acc: { [key: string]: number }, row) => {
          const service = row.service_name || 'Other'
          acc[service] = (acc[service] || 0) + (row.amount_paid || 0)
          return acc
        }, {})
        setSalesByCategoryData({
          labels: Object.keys(salesByCategoryMap),
          datasets: [{
            label: 'Revenue by Service',
            data: Object.values(salesByCategoryMap),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
          }],
        })

        // Payment Method Distribution
        const paymentMethodMap = paidData.reduce((acc: { [key: string]: number }, row) => {
          const method = row.payment_method || 'Unknown'
          acc[method] = (acc[method] || 0) + 1
          return acc
        }, {})
        setPaymentMethodData({
          labels: Object.keys(paymentMethodMap),
          datasets: [{
            label: 'Payment Methods',
            data: Object.values(paymentMethodMap),
            backgroundColor: [
              'rgba(255, 99, 132, 0.6)',
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)',
              'rgba(153, 102, 255, 0.6)',
            ],
          }],
        })
      }
    }

    fetchDashboardData()
  }, [filter, supabase])


  useEffect(() => {
    const fetchMembers = async () => {
      const { data: membersData } = await supabase.from('members').select('*')
      if (membersData) setMembers(membersData)
    }
    fetchMembers()
  }, [supabase])

  useEffect(() => {
    if (members.length > 0) {
      const monthlyNewMembers = members.reduce((acc: { [key: string]: number }, member) => {
        const joinDate = new Date(member.join_date);
        const monthYear = format(joinDate, 'MMM yyyy');
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});

      const sortedLabels = Object.keys(monthlyNewMembers).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });

      setNewMembersChartData({
        labels: sortedLabels,
        datasets: [{
          label: 'New Members',
          data: sortedLabels.map(label => monthlyNewMembers[label]),
          backgroundColor: '#4ade80',
        }],
      });
    }
  }, [members]);

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
          label: (context: TooltipItem<'line'>) => `₹${context.raw} on ${revenueChartData.labels[context.dataIndex]}`,
        },
      },
      datalabels: {
        display: false,
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { beginAtZero: true },
    },
  }

    return (
    <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      <div className="bg-gradient-to-br from-blue-50 to-white shadow-sm rounded-2xl p-6 col-span-1 md:col-span-2 xl:col-span-2">
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

      

      <div className="bg-white shadow rounded-2xl p-6 col-span-1 md:col-span-2 xl:col-span-3">
        <h2 className="text-lg font-semibold mb-4">Members Distribution</h2>
        <div className="h-[250px]">
          {memberCategoryData.labels.length > 0 && (
            <Bar data={memberCategoryData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => value,
                  color: 'black',
                },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }} />
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 col-span-1 md:col-span-2 xl:col-span-3">
        <h2 className="text-lg font-semibold mb-4">Sales by Service Category</h2>
        <div className="h-[250px]">
          {salesByCategoryData.labels.length > 0 && (
            <Bar data={salesByCategoryData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => value,
                  color: 'black',
                },
              },
              scales: {
                y: { beginAtZero: true },
              },
            }} />
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 col-span-1 md:col-span-2 xl:col-span-2">
        <h2 className="text-lg font-semibold mb-4">New Members Joined Over Time</h2>
        <div className="h-[400px]">
          {newMembersChartData.labels.length > 0 && (
            <Bar data={newMembersChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                datalabels: {
                  anchor: 'end',
                  align: 'top',
                  formatter: (value) => value,
                  color: 'black',
                },
              },
              scales: {
                x: { beginAtZero: true, categoryPercentage: 0.8, barPercentage: 0.9 },
                y: { beginAtZero: true },
              },
            }} />
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-2xl p-6 col-span-1 xl:col-span-1">
        <h2 className="text-lg font-semibold mb-4">Payment Method Distribution</h2>
        <div className="h-[250px] flex items-center justify-center">
          {paymentMethodData.labels.length > 0 && (
            <Pie data={paymentMethodData} options={{
              responsive: true,
              plugins: {
                legend: { position: 'right' },
                datalabels: {
                  formatter: (value, ctx) => {
                    if (!ctx.chart.data.datasets[0]) return '';
                    let sum = 0;
                    let dataArr = ctx.chart.data.datasets[0].data;
                    dataArr.forEach(data => {
                        sum += data;
                    });
                    let percentage = (value*100 / sum).toFixed(2)+'%';
                    return percentage;
                },
                  color: 'white',
                }
              }
            }} />
          )}
        </div>
      </div>

      
    </div>
  )
}

