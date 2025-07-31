'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'

import Image from 'next/image'

import { Menu } from 'lucide-react'

export default function Topbar({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const goToPOS = () => {
    router.push('/pos') // adjust if your POS route is different
  }

  return (
    <div className="w-full flex items-center justify-between px-2 py-2 sm:px-4 sm:py-3 bg-gray-800 shadow">
      <div className="flex items-center gap-2">
        <button onClick={toggleSidebar} className="text-white focus:outline-none p-2 block md:hidden">
          <Menu size={24} />
        </button>
        <div className="flex-shrink-0">
          <Image src="/logo.png" alt="Tenzin's Gym Logo" width={100} height={40} className="h-10 w-auto object-contain" />
        </div>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-lg md:text-2xl font-bold hidden md:block">ULTIMATE FITNESS FOR EVERYONE</p>
      </div>
      <div className="flex gap-2">
        <button onClick={goToPOS} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold">
          POS
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-semibold">
          Logout
        </button>
      </div>
    </div>
  )
}
