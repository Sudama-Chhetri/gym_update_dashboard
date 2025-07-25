'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
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
    <div className={`bg-gray-900 text-white min-h-screen ${collapsed ? 'w-16' : 'w-64'} transition-all overflow-y-auto h-screen`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h1 className="text-lg font-bold hidden sm:block">Menu</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-xl md:hidden">
          ☰
        </button>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-64px)]">
        <ul className="space-y-2 p-4 text-sm">
          {navItems.map(({ href, icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center space-x-2 hover:bg-gray-800 rounded px-2 py-1 transition-colors"
              >
                <span className="text-lg">{icon}</span>
                {!collapsed && <span className="hidden sm:inline">{label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
