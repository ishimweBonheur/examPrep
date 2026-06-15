import Navbar from '@/components/landing/Navbar'
import Footer from '@/components/landing/Footer'
import PageTransition from '@/components/shared/PageTransition'

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition />
      </main>
      <Footer />
    </div>
  )
}
