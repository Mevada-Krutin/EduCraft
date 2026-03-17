import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import { PlayCircle, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';
import Confetti from 'react-confetti';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);
    const [completedVideos, setCompletedVideos] = useState([]);
    const [courseProgress, setCourseProgress] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchCourseAndEnrollment = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/courses/${id}`);
                setCourse(data);
                if (data.videos && data.videos.length > 0) {
                    setActiveVideo(data.videos[0]);
                }

                // Check if user is enrolled
                if (user) {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const enrollmentsRes = await axios.get('http://localhost:5000/api/users/enrollments', config);
                    const enrolled = enrollmentsRes.data.find(e => e.course?._id === id);
                    if (enrolled) {
                        setIsEnrolled(true);
                        setCompletedVideos(enrolled.completedVideos || []);
                        setCourseProgress(enrolled.progress || 0);
                    }
                }

                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching course details');
                setLoading(false);
            }
        };

        fetchCourseAndEnrollment();
    }, [id, user]);

    const handleEnroll = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setEnrolling(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/users/enroll', { courseId: id }, config);
            setIsEnrolled(true);
            setEnrolling(false);
            // Optionally fetch enrollment details again to ensure state is completely in sync
        } catch (err) {
            setError(err.response?.data?.message || 'Error enrolling in course');
            setEnrolling(false);
        }
    };

    const handleMarkComplete = async (videoId) => {
        if (!user) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`http://localhost:5000/api/users/enrollments/${id}/progress`, { videoId }, config);
            setCompletedVideos(data.completedVideos || []);
            setCourseProgress(data.progress || 0);

            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 6000);
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    if (loading) return <div className="text-center py-5 mt-5">Loading course details...</div>;
    if (error) return <div className="text-center py-5 mt-5 text-red-500">{error}</div>;
    if (!course) return <div className="text-center py-5 mt-5">Course not found</div>;

    return (
        <div className="animate-fade-in mt-4">
            {showConfetti && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
                    <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={400} />
                </div>
            )}
            {/* Course Header */}
            <div className="card mb-5" style={{ padding: '2rem', backgroundColor: 'var(--surface-color)' }}>
                <div className="flex items-center gap-2 mb-3">
                    <div className="badge">{course.category}</div>
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{course.title}</h1>
                <p className="text-secondary mb-4" style={{ fontSize: '1.1rem', maxWidth: '800px' }}>
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-secondary mb-4">
                    <div className="flex items-center gap-1">
                        <GraduationCap size={18} />
                        <span>Instructor: {course.instructor?.name || 'Expert Instructor'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <PlayCircle size={18} />
                        <span>{course.videos?.length || 0} Lessons</span>
                    </div>
                </div>

                {!isEnrolled ? (
                    <div className="flex items-center gap-4 mt-2" style={{ padding: '1rem', backgroundColor: '#0f172a', borderRadius: '0.5rem', display: 'inline-flex' }}>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${course.price}</span>
                        <button
                            className="btn btn-primary"
                            onClick={handleEnroll}
                            disabled={enrolling}
                        >
                            {enrolling ? 'Processing...' : 'Enroll Now'}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mt-2 text-emerald-400">
                        <CheckCircle size={20} />
                        <span style={{ fontWeight: 600 }}>Enrolled</span>
                    </div>
                )}
            </div>

            <div className="grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Main Content (Video Player) */}
                <div>
                    {isEnrolled ? (
                        activeVideo ? (
                            <VideoPlayer
                                videoUrl={activeVideo.url}
                                title={activeVideo.title}
                                onMarkComplete={() => handleMarkComplete(activeVideo._id)}
                                isCompleted={completedVideos.includes(activeVideo._id)}
                            />
                        ) : (
                            <div className="card text-center py-5">
                                <p>No video content available for this course yet.</p>
                            </div>
                        )
                    ) : (
                        <div className="card text-center" style={{ padding: '4rem 2rem', backgroundColor: '#0f172a' }}>
                            <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <PlayCircle size={40} color="#818cf8" />
                            </div>
                            <h2 className="mb-2">Course Preview</h2>
                            <p className="text-secondary mb-4">Enroll in this course to access all video lessons and materials.</p>
                        </div>
                    )}

                    <div className="mt-5">
                        <h3>About this Course</h3>
                        <p className="text-secondary" style={{ lineHeight: '1.8' }}>
                            {course.description}
                        </p>
                    </div>
                </div>

                {/* Sidebar (Course Curriculum) */}
                <div className="card">
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h3 style={{ margin: 0 }}>Course Content</h3>
                        {/* Progress Bar */}
                        {isEnrolled && (
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-2 text-sm">
                                    <span className="text-secondary">Overall Progress</span>
                                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{courseProgress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${courseProgress}%`, backgroundColor: 'var(--primary-color)', transition: 'width 0.3s ease' }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div style={{ padding: '1rem' }}>
                        {course.videos && course.videos.length > 0 ? (
                            course.videos.map((video, index) => (
                                <div
                                    key={video._id || index}
                                    onClick={() => isEnrolled && setActiveVideo(video)}
                                    style={{
                                        padding: '1rem',
                                        borderRadius: '0.5rem',
                                        marginBottom: '0.5rem',
                                        cursor: isEnrolled ? 'pointer' : 'default',
                                        backgroundColor: activeVideo?._id === video._id ? 'rgba(99,102,241,0.1)' : 'transparent',
                                        borderLeft: activeVideo?._id === video._id ? '4px solid #818cf8' : '4px solid transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        opacity: isEnrolled ? 1 : 0.6
                                    }}
                                    className={isEnrolled ? 'hover:bg-slate-800 transition' : ''}
                                >
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                                        {index + 1}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{video.title}</h4>
                                        <span className="text-secondary text-sm">{video.duration || '5:00'} min</span>
                                    </div>
                                    {isEnrolled && activeVideo?._id !== video._id && (
                                        completedVideos.includes(video._id) ?
                                            <CheckCircle size={16} className="text-emerald-500" /> :
                                            <PlayCircle size={16} color="#64748b" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-secondary text-center py-4">Syllabus coming soon</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
