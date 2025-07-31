import { Suspense } from "react"
import MembershipPOSClient from "@/components/pos/membership/MembershipPOSClient"

export default function MembershipPOS() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MembershipPOSClient />
    </Suspense>
  )
}