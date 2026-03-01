import { AnalyzeDashboard } from '@/components/analyze-dashboard'

export default async function AnalyzePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className="flex flex-col h-screen">
      <AnalyzeDashboard id={id} />
    </div>
  )
}
