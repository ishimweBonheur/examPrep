import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Star, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Testimonial } from '@/types'

interface TestimonialsCarouselProps {
  title?: string
  compact?: boolean
  autoPlay?: boolean
}

export default function TestimonialsCarousel({
  title = 'What Students Say',
  compact = false,
  autoPlay = true,
}: TestimonialsCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const { data: reviews = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['public-testimonials'],
    queryFn: () =>
      base44.entities.Testimonial.filter({ is_active: true }, '-created_date', 20) as Promise<Testimonial[]>,
  })

  useEffect(() => {
    if (!autoPlay || reviews.length <= 1) return
    const timer = setInterval(() => {
      setActiveIndex((i) => (i === reviews.length - 1 ? 0 : i + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [autoPlay, reviews.length])

  const goPrev = () => setActiveIndex((i) => (i === 0 ? reviews.length - 1 : i - 1))
  const goNext = () => setActiveIndex((i) => (i === reviews.length - 1 ? 0 : i + 1))

  if (isLoading) {
    return (
      <div className={compact ? 'py-2' : 'py-8'}>
        <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (reviews.length === 0) return null

  const review = reviews[activeIndex]

  return (
    <div className={compact ? '' : 'py-4'}>
      {!compact && (
        <div className="text-center mb-6">
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground">{title}</h2>
        </div>
      )}

      {compact && (
        <p className="text-sm font-semibold text-foreground text-center mb-4">{title}</p>
      )}

      <div className="relative min-h-[120px]">
        <div className="text-center transition-all duration-500" key={review.id}>
          <div className="flex justify-center gap-1 mb-3">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className={`text-muted-foreground italic mb-3 ${compact ? 'text-sm' : 'text-base max-w-2xl mx-auto'}`}>
            &ldquo;{review.message}&rdquo;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
              {review.avatar_url ? (
                <img src={review.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground">{review.user_name}</p>
              <p className="text-xs text-muted-foreground">{review.role}</p>
            </div>
          </div>
        </div>
      </div>

      {reviews.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={goPrev} aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'}`}
                aria-label={`Review ${i + 1}`}
              />
            ))}
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={goNext} aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
