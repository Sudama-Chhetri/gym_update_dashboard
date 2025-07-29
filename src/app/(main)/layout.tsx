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
    <div className="flex min-h-screen"> {/* Changed to flex for main layout */}
      {/* Fixed Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 z-50 bg-white shadow-md hidden sm:block"> {/* Added fixed, h-screen, z-50, bg-white, shadow-md, hidden sm:block */}
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 sm:ml-64"> {/* Added sm:ml-64 to offset for fixed sidebar */}
        {/* Fixed Topbar */}
        <div className="fixed top-0 left-0 sm:left-64 w-full sm:w-[calc(100%-16rem)] z-40 bg-white shadow-sm"> {/* Added fixed, top-0, left-0, sm:left-64, w-full, sm:w-[calc(100%-16rem)], z-40, bg-white, shadow-sm */}
          <Topbar />
        </div>
        
        {/* 👇 Add toaster here so it works in all pages */}
        <Toaster position="top-right" />
        
        <main className="flex-1 p-4 overflow-y-auto mt-16"> {/* Added mt-16 to offset for fixed topbar */}
          {children}
        </main>
      </div>
    </div>
  )
}
