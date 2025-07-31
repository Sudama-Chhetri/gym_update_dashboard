'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Sidebar({ isSidebarOpen, toggleSidebar }: { isSidebarOpen: boolean; toggleSidebar: () => void }) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('role')
    setRole(storedRole)
  }, [])

  const navItems = [
    { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { href: '/members', icon: '👥', label: 'Members' },
    { href: '/memberships', icon: '💳', label: 'Memberships' },
    { href: '/trainers', icon: '🏋️', label: 'Trainers' },
    { href: '/products', icon: '📦', label: 'Products' },
    { href: '/food', icon: '🍽️', label: 'Restaurant' },
    { href: '/sales', icon: '🧾', label: 'Sales' },
    { href: '/expenses', icon: '💸', label: 'Expenses' },
    ...(role === 'admin' ? [{ href: '/reports', icon: '📊', label: 'Reports' }] : [])
  ]

  return (
    <div className="bg-gray-900 text-white min-h-screen transition-all overflow-y-auto h-screen">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Menu</h1>
        <button onClick={toggleSidebar} className="text-white focus:outline-none sm:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul className="space-y-2 p-4">
        {navItems.map(({ href, icon, label }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={toggleSidebar}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <span className="text-2xl">{icon}</span>
              <span className="font-medium">{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}