'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'

import Image from 'next/image'

export default function Topbar() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const goToPOS = () => {
    router.push('/pos') // adjust if your POS route is different
  }

  return (
    <div className="w-full flex items-center justify-between px-6 py-4 bg-gray-800 shadow">
      <div className="flex items-center gap-4">
        <Image src="/Image_28-07-25_at_6.25_PM-removebg-preview.png" alt="Tenzin's Gym Logo" width={80} height={40} />
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 text-xl font-bold">ULTIMATE FITNESS FOR EVERYONE</p>
      </div>
      <div className="flex gap-4">
        <button onClick={goToPOS} className="bg-blue-600 text-white px-3 py-1 rounded">
          POS
        </button>
        <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>
    </div>
  )
}
