import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCourses = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('http://localhost:5000/api/courses/instructor/my-courses', config);
            setCourses(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch courses');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourses();
        }
    }, [user]);

    const deleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`http://localhost:5000/api/courses/${id}`, config);
                fetchCourses();
            } catch (err) {
                alert('Failed to delete course');
            }
        }
    }

    if (loading) return <div className="text-center py-5">Loading Dashboard...</div>;

    return (
        <div className="animate-fade-in mt-4 max-w-6xl mx-auto px-4" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', margin: 0 }}>Instructor Dashboard</h2>
                <Link to="/instructor/course/create" className="btn btn-primary flex items-center gap-2">
                    <Plus size={18} /> Create New Course
                </Link>
            </div>
            {error && <div className="text-red-500 mb-4">{error}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {courses.length === 0 ? (
                    <p>You haven't created any courses yet.</p>
                ) : (
                    courses.map(course => (
                        <div key={course._id} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', marginTop: 0 }}>{course.title}</h3>
                            <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>{course.category} • ${course.price}</p>
                            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>{course.videos?.length || 0} Videos</p>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to={`/instructor/course/edit/${course._id}`} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>
                                    <Edit size={14} /> Edit
                                </Link>
                                <button onClick={() => deleteCourse(course._id)} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: '#ef4444', borderColor: '#ef4444' }}>
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
