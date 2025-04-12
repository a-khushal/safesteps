"use client"

import { useSession } from "@clerk/nextjs"
import MapboxMap from "../components/map"
import { useRouter } from "next/navigation"

function App() {
  const session = useSession()
  const router = useRouter()

  if (!session) {
    return router.push("/")
  }
  return (
    <>
      <MapboxMap />;
    </>
  )
}

export default App