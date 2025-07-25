// src/app/login/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

 const handleLogin = async () => {
  setError('')

  const { data: loginRes, error: loginErr } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (loginErr || !loginRes.user) {
    console.log('Login failed:', loginErr)
    setError('Invalid login credentials')
    return
  }

  const { data: sysUser, error: sysErr } = await supabase
    .from('system_users')
    .select('id, role')
    .eq('id', loginRes.user.id)
    .single()

  if (sysErr || !sysUser) {
    console.log('Not authorized:', sysErr)
    await supabase.auth.signOut()
    setError('You are not authorized to access this system')
    return
  }

  localStorage.setItem('role', sysUser.role)
  // ✅ All checks passed – redirect
  router.push('/dashboard')
}

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-3xl font-bold mb-6">Tenzin&apos;s Gym</h1>
      <div className="w-full max-w-sm bg-white p-6 rounded shadow">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-black text-white p-2"
        >
          Login
        </button>
        {error && <p className="text-sm text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  )
}
