import hotToast from 'react-hot-toast'

export { Toaster } from 'react-hot-toast'

export function toast(message: string | { title: string; description?: string }, type: 'success' | 'error' | 'info' = 'info') {
  const text = typeof message === 'string' ? message : message.description ? `${message.title}: ${message.description}` : message.title
  if (type === 'success') hotToast.success(text)
  else if (type === 'error') hotToast.error(text)
  else hotToast(text)
}
