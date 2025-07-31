import { Suspense } from "react"
import TrainerPOSClient from "@/components/pos/trainers/TrainerPOSClient"

export default function TrainerPOSPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TrainerPOSClient />
    </Suspense>
  )
}