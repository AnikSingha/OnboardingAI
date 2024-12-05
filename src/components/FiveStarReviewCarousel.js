import React, { useEffect, useState, useCallback } from 'react'
import { Star } from 'lucide-react'

// Sample 5-star review data
const fiveStarReviews = [
  { id: 1, author: "John Doe", text: "Absolutely love this product! It exceeded all my expectations.", company: "Tech Innovators Inc." },
  { id: 2, author: "Jane Smith", text: "Game-changing solution. Boosted our productivity tremendously!", company: "Creative Solutions Ltd." },
  { id: 3, author: "Mike Johnson", text: "Intuitive interface and powerful features. Highly recommended!", company: "Digital Dynamics" },
  { id: 4, author: "Emily Brown", text: "Best investment for our business this year. Customer support is top-notch!", company: "Global Enterprises" },
  { id: 5, author: "Chris Lee", text: "Streamlined our workflow like nothing else. A must-have tool!", company: "Innovative Systems" },
]

export default function FiveStarReviewCarousel() {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0)

  const nextReview = useCallback(() => {
    setCurrentReviewIndex((prevIndex) => 
      prevIndex === fiveStarReviews.length - 1 ? 0 : prevIndex + 1
    )
  }, [])

  useEffect(() => {
    const timer = setInterval(nextReview, 5000) // Change review every 5 seconds
    return () => clearInterval(timer)
  }, [nextReview])

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-[rgba(0,0,0,1)]">What Our Customers Say</h2>
        <div className="relative overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentReviewIndex * 100}%)` }}
          >
            {fiveStarReviews.map((review) => (
              <div key={review.id} className="w-full flex-shrink-0">
                <div className="mx-auto max-w-2xl p-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-2xl text-center mb-4 italic">"{review.text}"</blockquote>
                  <div className="text-center">
                    <cite className="text-xl font-semibold not-italic">{review.author}</cite>
                    <p className="text-base text-gray-600">{review.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-6">
          {fiveStarReviews.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full mx-1 ${
                index === currentReviewIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              onClick={() => setCurrentReviewIndex(index)}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}