import Sidebar from '@/components/navigation/sidebar'
import Topbar from '@/components/navigation/topbar'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Toaster } from 'react-hot-toast'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen sm:flex-row">
      {/* Sidebar stacks vertically on small screens */}
      <div className="sm:w-64 w-full">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        <Topbar />
        
        {/* 👇 Add toaster here so it works in all pages */}
        <Toaster position="top-right" />
        
        <main className="flex-1 p-4 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
