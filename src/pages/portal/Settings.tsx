import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import toast from 'react-hot-toast'
import { Moon, Bell, Globe, Shield } from 'lucide-react'

export default function Settings() {
  const { user, logout } = useAuth()
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [pushNotifs, setPushNotifs] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState('en')

  const toggleDark = (on: boolean) => {
    setDarkMode(on)
    document.documentElement.classList.toggle('dark', on)
  }

  const handleLogout = () => logout(true)

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires backend confirmation.')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your ExamPrep experience.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifs">Email notifications</Label>
            <Switch id="email-notifs" checked={emailNotifs} onCheckedChange={setEmailNotifs} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifs">Push notifications</Label>
            <Switch id="push-notifs" checked={pushNotifs} onCheckedChange={setPushNotifs} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="w-5 h-5" /> Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode" className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark mode</Label>
            <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDark} />
          </div>
          <div className="space-y-2">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Button variant="destructive" onClick={handleDeleteAccount} className="w-full">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
