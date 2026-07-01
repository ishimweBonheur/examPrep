import { Link, useLocation } from 'react-router-dom'
import {
  GraduationCap, LogOut, ChevronLeft, ChevronRight, X,
  type LucideIcon,
} from 'lucide-react'
import { base44 } from '@/api/client'
import { cn } from '@/lib/utils'
import { adminNavItems } from '@/lib/admin-nav'
import { useMessageUnreadCount } from '@/hooks/use-message-unread'

interface AdminSidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarLink({
  item,
  isActive,
  collapsed,
  onClick,
  badge,
}: {
  item: { path: string; icon: LucideIcon; label: string }
  isActive: boolean
  collapsed: boolean
  onClick?: () => void
  badge?: number
}) {
  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={cn(
        'relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary" />
      )}
      <span className="relative shrink-0">
        <item.icon className={cn('w-5 h-5', isActive && 'text-primary')} />
        {badge !== undefined && badge > 0 && collapsed && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1">{item.label}</span>
          {badge !== undefined && badge > 0 && (
            <span className="min-w-5 h-5 px-1.5 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}

export default function AdminSidebar({
  collapsed,
  setCollapsed,
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const location = useLocation()
  const { data: messageUnread = 0 } = useMessageUnreadCount()

  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname === path || location.pathname.startsWith(`${path}/`)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-border z-40 flex flex-col transition-all duration-300 shadow-sm',
        collapsed ? 'w-[72px]' : 'w-64',
        'max-md:-translate-x-full',
        mobileOpen && 'max-md:translate-x-0',
        'md:translate-x-0'
      )}
    >
      <div className="h-16 flex items-center justify-between gap-2 px-4 border-b border-border shrink-0">
        <Link to="/admin" className="flex items-center gap-2.5 min-w-0" onClick={onMobileClose}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <span className="font-heading font-extrabold text-lg text-foreground tracking-tight truncate">
              UMUZI
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-muted shrink-0"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-5 px-3 overflow-y-auto">
        <div className="space-y-1">
          {adminNavItems.map((item) => (
            <SidebarLink
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              collapsed={collapsed}
              onClick={onMobileClose}
              badge={item.path === '/admin/messages' ? messageUnread : undefined}
            />
          ))}
        </div>
      </nav>

      <div className="p-3 border-t border-border space-y-1 shrink-0">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted w-full transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>

        <button
          type="button"
          onClick={() => base44.auth.logout('/')}
          title={collapsed ? 'Logout' : undefined}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 w-full transition-all"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
