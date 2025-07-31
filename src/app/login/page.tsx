// src/app/login/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase/supabaseClient'

import Image from 'next/image'

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Login
        </button>
        {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  )
}
