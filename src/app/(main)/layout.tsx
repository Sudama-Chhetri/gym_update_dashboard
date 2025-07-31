'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/navigation/sidebar'
import Topbar from '@/components/navigation/topbar'

import { useRouter } from 'next/navigation'
import { Toaster } from 'react-hot-toast'
import { supabase } from '@/lib/supabase/supabaseClient'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-screen w-64 z-50 bg-white shadow-md transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out md:block`}>
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Topbar */}
        <div className="fixed top-0 left-0 w-full md:left-64 md:w-[calc(100%-16rem)] z-40 bg-white shadow-sm">
          <Topbar toggleSidebar={toggleSidebar} />
        </div>
        
        <Toaster position="top-right" />
        
        <main className="flex-1 p-4 overflow-y-auto mt-16 md:mt-20">
          {children}
        </main>
      </div>
    </div>
  )
}
