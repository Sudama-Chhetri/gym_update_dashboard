import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient() // ✅ Fix here

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <h1 className="text-xl font-bold">Dashboard</h1>
      {/* your dashboard content */}
    </div>
  )
}
