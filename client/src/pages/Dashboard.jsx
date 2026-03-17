import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { Book, Clock, Award } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('http://localhost:5000/api/users/enrollments', config);
                setEnrollments(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching enrollments:', error);
                setLoading(false);
            }
        };

        if (user) {
            fetchEnrollments();
        }
    }, [user]);

    const activeCourses = enrollments.length;
    const certificates = enrollments.filter(e => e.progress === 100).length;
    
    let totalMinutes = 0;
    enrollments.forEach(e => {
        if (e.course && e.course.videos && e.completedVideos) {
            e.course.videos.forEach(v => {
                if (e.completedVideos.includes(v._id)) {
                    totalMinutes += (v.duration || 5); // Fallback to 5 if duration not listed
                }
            });
        }
    });
    const hoursWatched = Math.floor(totalMinutes / 60) || (totalMinutes > 0 ? '<1' : 0);

    return (
        <div className="animate-fade-in mt-4">
            <div className="flex items-center gap-4 mb-5">
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600 }}>
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h2>Welcome back, {user?.name}!</h2>
                    <p className="text-secondary">Ready to continue your learning journey?</p>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="card" style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(99,102,241,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <Book size={24} color="#818cf8" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{activeCourses}</h3>
                        <p className="text-secondary text-sm">Active Courses</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <Clock size={24} color="#10b981" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{hoursWatched}h</h3>
                        <p className="text-secondary text-sm">Hours Watched</p>
                    </div>
                </div>
                <div className="card" style={{ padding: '1.5rem', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '1rem', borderRadius: '0.5rem' }}>
                        <Award size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <h3 style={{ margin: 0 }}>{certificates}</h3>
                        <p className="text-secondary text-sm">Certificates</p>
                    </div>
                </div>
            </div>

            {/* My Courses */}
            <h3>My Learning</h3>

            {loading ? (
                <div className="text-center py-5">
                    <p>Loading your courses...</p>
                </div>
            ) : enrollments.length === 0 ? (
                <div className="card text-center" style={{ padding: '3rem 2rem' }}>
                    <Book size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                    <h3 className="mb-2">No courses yet</h3>
                    <p className="text-secondary mb-4">Explore our catalog and start learning today!</p>
                    <a href="/" className="btn btn-primary">Browse Courses</a>
                </div>
            ) : (
                <div className="grid grid-cols-3">
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} style={{ position: 'relative' }}>
                            <CourseCard course={enrollment.course} />

                            {/* Progress Bar Overlay */}
                            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderTop: '1px solid var(--border-color)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span>Progress</span>
                                    <span style={{ fontWeight: 600 }}>{enrollment.progress}%</span>
                                </div>
                                <div style={{ width: '100%', backgroundColor: '#334155', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ width: `${enrollment.progress}%`, backgroundColor: '#10b981', height: '100%' }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
