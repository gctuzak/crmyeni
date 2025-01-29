import { getFirsat } from "@/lib/actions/firsat"
import { FirsatDetay } from "@/components/firsatlar/firsat-detay"
import { notFound } from "next/navigation"

interface FirsatDetayPageProps {
  params: {
    id: string
  }
}

export default async function FirsatDetayPage({ params }: FirsatDetayPageProps) {
  const { firsat, error } = await getFirsat(parseInt(params.id))

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (!firsat) {
    notFound()
  }

  return <FirsatDetay firsat={firsat} />
} 