import { motion } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

export default function PageTransition() {
  const location = useLocation()

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <Outlet />
    </motion.div>
  )
}
