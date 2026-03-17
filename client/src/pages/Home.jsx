import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { BookOpen, Users, Star } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/courses');
                setCourses(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleGetStarted = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setActionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: enrollments } = await axios.get('http://localhost:5000/api/users/enrollments', config);

            if (enrollments && enrollments.length > 0) {
                // Find an in-progress course, or just the first one
                const inProgress = enrollments.find(e => e.progress < 100);
                const targetCourse = inProgress || enrollments[0];
                if (targetCourse.course && targetCourse.course._id) {
                    navigate(`/course/${targetCourse.course._id}`);
                    return;
                }
            }

            navigate('/courses');
        } catch (error) {
            console.error('Error finding in-progress course:', error);
            navigate('/courses');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-5 mt-4">
                <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Master Your Craft
                </h1>
                <p className="text-secondary mb-4" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Join the premier educational platform designed to elevate your skills with world-class instructors and interactive courses.
                </p>
                <div className="flex justify-center gap-4">
                    <button
                        className="btn btn-primary"
                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                        onClick={handleGetStarted}
                        disabled={actionLoading}
                    >
                        {actionLoading ? 'Loading...' : 'Get Started'}
                    </button>
                    <button
                        className="btn btn-outline"
                        style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}
                        onClick={() => navigate('/courses')}
                    >
                        Browse Courses
                    </button>
                </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-4 mb-5 mt-5">
                <div className="card text-center" style={{ padding: '2rem' }}>
                    <div className="flex justify-center mb-3">
                        <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <BookOpen size={32} color="#818cf8" />
                        </div>
                    </div>
                    <h3>Expert Curriculums</h3>
                    <p className="text-secondary">Learn from industry leaders with structured, up-to-date content.</p>
                </div>
                <div className="card text-center" style={{ padding: '2rem' }}>
                    <div className="flex justify-center mb-3">
                        <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <Users size={32} color="#818cf8" />
                        </div>
                    </div>
                    <h3>Community Driven</h3>
                    <p className="text-secondary">Engage with thousands of peers in interactive learning environments.</p>
                </div>
                <div 
                    className="card text-center transition hover:scale-105" 
                    style={{ padding: '2rem', cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <div className="flex justify-center mb-3">
                        <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <Star size={32} color="#818cf8" />
                        </div>
                    </div>
                    <h3>Certifications</h3>
                    <p className="text-secondary">Earn verifiable certificates to boost your professional profile.</p>
                </div>
            </div>

            {/* Course Listing */}
            <div className="mt-5">
                <div className="flex justify-between items-center mb-4">
                    <h2>Featured Courses</h2>
                    <a href="#" style={{ color: '#818cf8', fontWeight: 600 }}>View all →</a>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <p>Loading courses...</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-5 card">
                        <h3 className="mb-2">No courses found</h3>
                        <p className="text-secondary">Check back later for new content.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {courses.map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
