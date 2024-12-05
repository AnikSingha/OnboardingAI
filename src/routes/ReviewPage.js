import React, { useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import Header from '../components/Header';



// Sample review data
const initialReviews = [
  { id: 1, author: "John Doe", rating: 5, date: "2023-05-15", text: "Excellent product! Exceeded my expectations." },
  { id: 2, author: "Jane Smith", rating: 4, date: "2023-05-10", text: "Great product, but could use some minor improvements." },
  { id: 3, author: "Mike Johnson", rating: 5, date: "2023-05-05", text: "Absolutely love it! Will definitely buy again." },
  { id: 4, author: "Emily Brown", rating: 3, date: "2023-04-30", text: "Decent product, but not as good as I hoped." },
  { id: 5, author: "Chris Lee", rating: 2, date: "2023-04-25", text: "Disappointed with the quality. Expected better." },
];

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-7 h-7 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'} cursor-pointer`}
          onClick={() => setRating && setRating(i + 1)}
        />
      ))}
    </div>
  );
};

const ReviewSummary = ({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
      <h2 className="text-5xl font-bold mb-6 text-[rgba(0,0,0,1)]">Customer Reviews</h2>
      <div className="flex items-center mb-6">
        <span className="text-6xl font-bold mr-4 text-[rgba(0,0,0,1)]">{averageRating.toFixed(1)}</span>
        <div>
          <StarRating rating={Math.round(averageRating)} />
          <span className="text-sm text-gray-600 mt-1 block">Based on {totalReviews} reviews</span>
        </div>
      </div>
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center mb-3">
          <span className="w-12 text-sm text-gray-600">{star} star</span>
          <div className="flex-grow mx-4 bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-400 h-2 rounded-full"
              style={{ width: `${((ratingCounts[star] || 0) / totalReviews) * 100}%` }}
            ></div>
          </div>
          <span className="w-12 text-sm text-right text-gray-600">
            {Math.round(((ratingCounts[star] || 0) / totalReviews) * 100)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const ReviewList = ({ reviews, filter, sort }) => {
  const filteredReviews = reviews
    .filter((review) => filter === 'all' || review.rating === parseInt(filter))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.date) - new Date(a.date);
      return new Date(a.date) - new Date(b.date);
    });

  return (
    <div className="space-y-6">
      {filteredReviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-[rgba(0,0,0,1)]">{review.author}</h3>
            <span className="text-sm text-gray-500">{review.date}</span>
          </div>
          <StarRating rating={review.rating} />
          <p className="mt-3 text-lg text-gray-700">{review.text}</p>
        </div>
      ))}
    </div>
  );
};

const ReviewForm = ({ onSubmit }) => {
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (author && rating && text) {
      onSubmit({ author, rating, text, date: new Date().toISOString().split('T')[0] });
      setAuthor('');
      setRating(0);
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-3xl font-bold mb-4 text-[rgba(0,0,0,1)]">Write a Review</h3>
      <div className="mb-4">
        <label htmlFor="author" className="block text-base font-medium text-gray-700 mb-1">Your Name</label>
        <input
          type="text"
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(219,214,247,1)]"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block text-base font-medium text-gray-700 mb-1">Your Rating</label>
        <StarRating rating={rating} setRating={setRating} />
      </div>
      <div className="mb-4">
        <label htmlFor="review" className="block text-base font-medium text-gray-700 mb-1">Your Review</label>
        <textarea
          id="review"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(219,214,247,1)]"
          rows="4"
          required
        ></textarea>
      </div>
      <button
        type="submit"
        className="bg-[rgba(219,214,247,1)] text-[rgba(0,0,0,1)] text-lg font-semibold py-3 px-6 rounded-md hover:bg-[rgba(199,194,227,1)] transition-colors"
      >
        Submit Review
      </button>
    </form>
  );
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState(initialReviews);
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');

  const handleNewReview = (newReview) => {
    setReviews([{ id: reviews.length + 1, ...newReview }, ...reviews]);
  };

  return (
    
    <div className="min-h-screen bg-[rgba(219,214,247,1)] py-16 px-4 sm:px-6 lg:px-8">

      <div className="max-w-4xl mx-auto">
        <ReviewSummary reviews={reviews} />
        <ReviewForm onSubmit={handleNewReview} />
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div className="relative">
              <select
                className="appearance-none bg-gray-100 text-[rgba(0,0,0,1)] text-lg py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[rgba(219,214,247,1)]"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
            <div className="relative">
              <select
                className="appearance-none bg-gray-100 text-[rgba(0,0,0,1)] text-lg py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-[rgba(219,214,247,1)]"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4" />
              </div>
            </div>
          </div>
          <ReviewList reviews={reviews} filter={filter} sort={sort} />
        </div>
      </div>
    </div>
  );
}