import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useOnlineStatus } from '@/hooks/use-online'

export default function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-foreground text-background px-4 py-3 rounded-xl shadow-lg">
      <WifiOff className="w-4 h-4" />
      <span className="text-sm font-medium">You are offline</span>
      <Button size="sm" variant="secondary" onClick={() => window.location.reload()} className="h-7 gap-1">
        <RefreshCw className="w-3 h-3" /> Retry
      </Button>
    </div>
  )
}
