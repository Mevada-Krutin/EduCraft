import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Shield, User as UserIcon, Book, Star } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [view, setView] = useState('users');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAdminData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [usersRes, coursesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/users', config),
                axios.get('http://localhost:5000/api/courses')
            ]);
            setUsers(usersRes.data);
            setCourses(coursesRes.data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch admin data');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAdminData();
        } else {
            setError('Not authorized to view this page');
            setLoading(false);
        }
    }, [user]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }, config);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update user role');
        }
    };

    if (loading) return <div className="text-center py-5">Loading Admin Dashboard...</div>;

    return (
        <div className="animate-fade-in mt-4 max-w-6xl mx-auto px-4" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={32} color="#4f46e5" />
                    Admin Control Panel
                </h2>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button 
                    onClick={() => setView('users')} 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: view === 'users' ? '#4f46e5' : '#e2e8f0', color: view === 'users' ? '#fff' : '#475569' }}
                >
                    User Management
                </button>
                <button 
                    onClick={() => setView('courses')} 
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: view === 'courses' ? '#4f46e5' : '#e2e8f0', color: view === 'courses' ? '#fff' : '#475569' }}
                >
                    Course Overview & Ratings
                </button>
            </div>
            
            {error ? (
                <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>{error}</div>
            ) : view === 'users' ? (
                <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Name</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Email</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Current Role</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                            <UserIcon size={16} color="#64748b" />
                                            {u.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{u.email}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '9999px',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            backgroundColor: u.role === 'admin' ? '#fee2e2' : u.role === 'instructor' ? '#dbeafe' : '#f1f5f9',
                                            color: u.role === 'admin' ? '#b91c1c' : u.role === 'instructor' ? '#1d4ed8' : '#475569'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        {u.role !== 'admin' && (
                                            <select 
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
                                            >
                                                <option value="student">Student</option>
                                                <option value="instructor">Instructor</option>
                                            </select>
                                        )}
                                        {u.role === 'admin' && <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Cannot change admin role</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Course Title</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Instructor</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Price</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Rating</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: '#475569' }}>Reviews</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No courses published yet.</td>
                                </tr>
                            ) : courses.map(c => (
                                <tr key={c._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
                                            <Book size={16} color="#6366f1" />
                                            <a href={`/course/${c._id}`} target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'none' }}>{c.title}</a>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{c.instructor?.name || 'Unknown'}</td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>${c.price}</td>
                                    <td style={{ padding: '1rem' }}>
                                        {c.rating > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#facc15', fontWeight: 600 }}>
                                                <Star size={16} fill="currentColor" /> {c.rating.toFixed(1)}
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>No ratings</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#64748b' }}>{c.numReviews} review{c.numReviews !== 1 ? 's' : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
