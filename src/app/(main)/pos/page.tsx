'use client'
import { useRouter } from 'next/navigation'

export default function POSHub() {
  const router = useRouter()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Point of Sale</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => router.push('/pos/membership')}
          className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded"
        >
          Membership
        </button>
        <button
          onClick={() => router.push('/pos/products')}
          className="bg-green-500 hover:bg-green-600 text-white py-3 rounded"
        >
          Products
        </button>
        <button
          onClick={() => router.push('/pos/trainers')}
          className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded"
        >
          Trainers
        </button>
        <button
          onClick={() => router.push('/pos/restaurant')}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded"
        >
          Restaurant
        </button>
      </div>
    </div>
  )
}
