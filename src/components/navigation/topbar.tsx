'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/supabaseClient'

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
    <div className="w-full flex items-center justify-between px-6 py-4 bg-white shadow">
      <h1 className="text-xl font-bold">Tenzin&apos;s Gym</h1>
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
