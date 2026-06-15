import { useQuery, useQueryClient } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/format-date'
import { PageLoader } from '@/components/shared/LoadingSkeleton'
import EmptyState from '@/components/shared/EmptyState'
import { Link } from 'react-router-dom'
import type { Notification } from '@/types'

export default function Notifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['notifications', user?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: user?.id }, '-created_date', 50) as Promise<Notification[]>,
    enabled: !!user?.id,
  })

  const markAllRead = async () => {
    await Promise.all(notifications.filter((n) => !n.read).map((n) => base44.entities.Notification.update(n.id, { read: true })))
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  const markRead = async (id: string) => {
    await base44.entities.Notification.update(id, { read: true })
    queryClient.invalidateQueries({ queryKey: ['notifications'] })
  }

  if (isLoading) return <PageLoader />

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Notifications</h1>
          <p className="text-muted-foreground mt-1">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="We'll notify you about new past papers, replies, and study reminders." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? 'opacity-70' : 'border-primary/30'}>
              <CardContent className="p-4 flex items-start gap-4">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{n.title}</p>
                    <Badge variant="outline" className="text-xs">{n.type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDate(n.created_date, 'relative')}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Read</Button>}
                  {n.link && <Link to={n.link}><Button size="sm" variant="outline">View</Button></Link>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
