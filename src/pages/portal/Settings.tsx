import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserSettings, updateUserSettings, requestClassLevelChange, fetchMyClassLevelRequests, apiDelete } from '@/api/http'
import toast from 'react-hot-toast'
import { Bell, Shield, GraduationCap, Globe, Loader2 } from 'lucide-react'
import { STUDENT_LEVELS, levelLabel } from '@/lib/student-level'
import type { StudentLevel } from '@/types'

export default function Settings() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const [pendingLevel, setPendingLevel] = useState<StudentLevel | null>(null)
  const level = pendingLevel ?? user?.level ?? 'S3'
  const [savingLevel, setSavingLevel] = useState(false)
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const { data: settings, isLoading: loadingSettings, isError } = useQuery({
    queryKey: ['user-settings', user?.id],
    queryFn: fetchUserSettings,
    enabled: !!user?.id,
  })

  const { data: levelRequests = [] } = useQuery({
    queryKey: ['class-level-requests', user?.id],
    queryFn: fetchMyClassLevelRequests,
    enabled: !!user?.id,
  })

  const pendingRequest = levelRequests.find((r) => r.status === 'pending')

  const persistSettings = async (patch: Parameters<typeof updateUserSettings>[0], key: string) => {
    setSavingKey(key)
    try {
      await updateUserSettings(patch)
      await queryClient.invalidateQueries({ queryKey: ['user-settings'] })
      toast.success('Settings saved')
    } catch {
      toast.error('Could not save settings')
    } finally {
      setSavingKey(null)
    }
  }

  const handleLogout = () => logout(true)

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    if (!window.confirm('Delete your account permanently? This cannot be undone.')) return
    try {
      await apiDelete(`/users/${user.id}`)
      toast.success('Account deleted')
      logout(true)
    } catch {
      toast.error('Could not delete account')
    }
  }

  const handleLevelChange = async (value: StudentLevel) => {
    if (value === user?.level) return
    setPendingLevel(value)
    if (!user?.id) return
    setSavingLevel(true)
    try {
      await requestClassLevelChange(value)
      toast.success('Class level change request submitted for admin approval')
      queryClient.invalidateQueries({ queryKey: ['class-level-requests'] })
    } catch (err: unknown) {
      setPendingLevel(null)
      toast.error(err instanceof Error ? err.message : 'Could not submit class level request')
    } finally {
      setSavingLevel(false)
    }
  }

  const saving = (key: string) => savingKey === key

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your UMUZI experience.</p>
      </div>

      {isError && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">Could not load settings. Please refresh.</p>
      )}

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Class Level</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Your class level was set at registration. To change it, select a new level — admin approval is required.
          </p>
          {pendingRequest && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Pending request to change to {levelLabel(pendingRequest.requested_level)}. Waiting for admin approval.
            </p>
          )}
          <Select value={level} onValueChange={(v) => handleLevelChange(v as StudentLevel)}>
            <SelectTrigger className={pendingRequest || savingLevel ? 'opacity-60 pointer-events-none' : ''}><SelectValue /></SelectTrigger>
            <SelectContent>
              {STUDENT_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{levelLabel(l)} ({l})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {loadingSettings ? (
            <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading...</div>
          ) : (
            <>
              {[
                { id: 'email-notifs', key: 'email', label: 'Email notifications', field: 'email_notifications' as const },
                { id: 'push-notifs', key: 'push', label: 'Push notifications', field: 'push_notifications' as const },
                { id: 'learning-reminders', key: 'learning', label: 'Learning reminders', field: 'learning_reminders' as const },
                { id: 'community-notifs', key: 'community', label: 'Community notifications', field: 'community_notifications' as const },
                { id: 'result-notifs', key: 'result', label: 'Result notifications', field: 'result_notifications' as const },
              ].map(({ id, key, label, field }) => (
                <div key={id} className="flex items-center justify-between">
                  <Label htmlFor={id}>{label}</Label>
                  <div className="flex items-center gap-2">
                    {saving(key) && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}
                    <Switch
                      id={id}
                      checked={settings?.[field] ?? true}
                      disabled={!!savingKey}
                      onCheckedChange={(v) => void persistSettings({ [field]: v }, key)}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Privacy</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Profile visibility</Label>
            <Select
              value={settings?.profile_visibility ?? 'public'}
              onValueChange={(v) => {
                void persistSettings({ profile_visibility: v as 'public' | 'private' | 'friends' }, 'visibility')
              }}
            >
              <SelectTrigger className={savingKey ? 'opacity-60 pointer-events-none' : ''}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public — visible to community</SelectItem>
                <SelectItem value="friends">Friends only</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="show-progress">Show progress on profile</Label>
            <Switch
              id="show-progress"
              checked={settings?.show_progress ?? true}
              disabled={!!savingKey}
              onCheckedChange={(v) => void persistSettings({ show_progress: v }, 'progress')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" /> Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Language</Label>
            <Select
              value={settings?.language ?? 'en'}
              onValueChange={(v) => void persistSettings({ language: v }, 'language')}
            >
              <SelectTrigger className={savingKey ? 'opacity-60 pointer-events-none' : ''}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="rw">Kinyarwanda</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Shield className="w-5 h-5" /> Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Signed in as <strong>{user?.email}</strong></p>
          <Button variant="outline" onClick={handleLogout} className="w-full">Sign out</Button>
          <Button variant="destructive" onClick={() => void handleDeleteAccount()} className="w-full">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
