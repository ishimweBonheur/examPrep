export function getPortalHomePath(role?: string): string {
  return role === 'admin' ? '/admin' : '/dashboard'
}
