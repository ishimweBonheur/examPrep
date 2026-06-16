import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { base44 } from '@/api/client'
import { Star, ChevronLeft, ChevronRight, Quote, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Testimonial } from '@/types'

function ReviewCard({ review, active }: { review: Testimonial; active?: boolean }) {
  return (
    <div
      className={`bg-card rounded-xl border p-6 transition-all duration-300 h-full flex flex-col
        ${active ? 'border-primary/30 shadow-lg shadow-primary/5 scale-[1.02]' : 'border-border hover:border-primary/20 hover:shadow-md'}`}
    >
      <Quote className="w-8 h-8 text-primary/20 mb-3 shrink-0" />
      <div className="flex gap-0.5 mb-3">
        {[...Array(review.rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-muted-foreground text-sm leading-relaxed flex-1 mb-5">
        &ldquo;{review.message}&rdquo;
      </p>
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
          {review.avatar_url ? (
            <img src={review.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5 text-primary" />
          )}
        </div>
        <div>
          <div className="font-bold text-foreground text-sm">{review.user_name}</div>
          <div className="text-xs text-muted-foreground">{review.role}</div>
        </div>
      </div>
    </div>
  )
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const { data: reviews = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['public-testimonials'],
    queryFn: () =>
      base44.entities.Testimonial.filter({ is_active: true }, '-created_date', 20) as Promise<Testimonial[]>,
  })

  const goPrev = () => setActiveIndex((i) => (i === 0 ? reviews.length - 1 : i - 1))
  const goNext = () => setActiveIndex((i) => (i === reviews.length - 1 ? 0 : i + 1))

  if (isLoading) {
    return (
      <div className="py-12 border-t border-border">
        <div className="h-8 w-48 bg-muted rounded mx-auto mb-8 animate-pulse" />
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (reviews.length === 0) return null

  return (
    <div className="py-12 border-t border-border">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-foreground">What Students Say</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
          Real feedback from students preparing for national exams across Rwanda.
        </p>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {reviews.slice(0, 6).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Mobile carousel */}
      <div className="md:hidden">
        <ReviewCard review={reviews[activeIndex]} active />
        {reviews.length > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button size="icon" variant="outline" className="rounded-full" onClick={goPrev} aria-label="Previous review">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`h-2 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'}`}
                  aria-label={`Go to review ${i + 1}`}
                />
              ))}
            </div>
            <Button size="icon" variant="outline" className="rounded-full" onClick={goNext} aria-label="Next review">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
