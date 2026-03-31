import { useState } from 'react';
import axios from 'axios';
import { Star, MessageCircle, Send } from 'lucide-react';

const CourseReviews = ({ courseId, reviews, rating, numReviews, isEnrolled, user, onReviewAdded }) => {
    const [ratingInput, setRatingInput] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const hasReviewed = user ? reviews.some(r => r.user.toString() === user._id.toString()) : false;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (ratingInput === 0) {
            setError('Please select a rating');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`http://localhost:5000/api/courses/${courseId}/reviews`, { rating: ratingInput, comment }, config);
            setSuccess('Review submitted successfully!');
            setRatingInput(0);
            setComment('');
            if (onReviewAdded) onReviewAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-5 pt-5 pb-5" style={{ borderTop: '1px solid var(--border-color)' }}>
            <h3 className="mb-4 flex items-center gap-2"><MessageCircle /> Student Reviews</h3>
            
            <div className="flex items-center gap-4 mb-5">
                <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-color)', lineHeight: 1 }}>
                    {rating > 0 ? rating.toFixed(1) : '0.0'}
                </div>
                <div>
                    <div className="flex text-yellow-400 mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={20} fill={star <= Math.round(rating) ? 'currentColor' : 'none'} color={star <= Math.round(rating) ? 'currentColor' : '#94a3b8'} />
                        ))}
                    </div>
                    <span className="text-secondary">{numReviews} {numReviews === 1 ? 'review' : 'reviews'}</span>
                </div>
            </div>

            {isEnrolled && !hasReviewed && (
                <form onSubmit={handleSubmit} className="card p-4 mb-5 bg-slate-800/50">
                    <h4 className="mb-3">Write a Review</h4>
                    {error && <div className="text-red-400 mb-2">{error}</div>}
                    {success && <div className="text-emerald-400 mb-2">{success}</div>}
                    
                    <div className="mb-3">
                        <label className="block text-secondary text-sm mb-2">Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={28} 
                                    className="cursor-pointer transition-colors"
                                    color={star <= (hoverRating || ratingInput) ? '#facc15' : '#475569'}
                                    fill={star <= (hoverRating || ratingInput) ? '#facc15' : 'none'}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRatingInput(star)}
                                />
                            ))}
                        </div>
                    </div>
                    
                    <div className="mb-3">
                        <label className="block text-secondary text-sm mb-2">Comment</label>
                        <textarea 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows="3"
                            placeholder="Share your experience taking this course..."
                            className="input w-full"
                        ></textarea>
                    </div>
                    
                    <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2">
                        <Send size={16} /> {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            )}

            {isEnrolled && hasReviewed && (
                <div className="card p-4 mb-5 text-center bg-emerald-900/20 text-emerald-400 border border-emerald-500/30">
                    <p className="m-0">Thank you for reviewing this course!</p>
                </div>
            )}

            <div className="grid gap-4 mt-4">
                {reviews.length === 0 ? (
                    <p className="text-secondary card p-5 text-center">No reviews yet. Be the first to leave a review!</p>
                ) : (
                    [...reviews].reverse().map(review => (
                        <div key={review._id} className="card p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                        {review.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{review.name}</div>
                                        <div className="text-secondary text-xs">{new Date(review.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="flex text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} color={star <= review.rating ? 'currentColor' : '#64748b'} />
                                    ))}
                                </div>
                            </div>
                            <p className="mt-2 text-slate-300" style={{ lineHeight: 1.5 }}>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CourseReviews;
