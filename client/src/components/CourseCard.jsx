import { Link } from 'react-router-dom';
import { PlayCircle, Clock, Star } from 'lucide-react';

const CourseCard = ({ course }) => {
    // Use a placeholder image based on category or default
    const getCoverImage = () => {
        const defaultColor = '2563eb';
        return `https://placehold.co/600x400/${defaultColor}/ffffff?text=${encodeURIComponent(course.title)}`;
    };

    return (
        <div className="card">
            <img src={getCoverImage()} alt={course.title} className="card-img" />
            <div className="card-body">
                <div className="badge mb-2">{course.category}</div>
                <h3 className="card-title mb-1">{course.title}</h3>

                {course.rating > 0 ? (
                    <div className="flex items-center gap-1 mb-2 mt-1">
                        <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star key={star} size={14} fill={star <= Math.round(course.rating) ? 'currentColor' : 'none'} color={star <= Math.round(course.rating) ? 'currentColor' : '#94a3b8'} />
                            ))}
                        </div>
                        <span className="text-secondary text-xs">({course.numReviews})</span>
                    </div>
                ) : (
                    <div className="text-secondary text-xs mb-2 mt-1 italic">No reviews yet</div>
                )}
                
                <p className="card-text">{course.description.substring(0, 80)}...</p>

                <div className="flex items-center gap-4 text-sm text-secondary mb-3">
                    <div className="flex items-center gap-1">
                        <PlayCircle size={16} />
                        <span>{course.videos?.length || 0} Lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Beginner</span>
                    </div>
                </div>

                <div className="card-footer">
                    <span className="price-tag">${course.price}</span>
                    <Link to={`/course/${course._id}`} className="btn btn-primary text-sm">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
