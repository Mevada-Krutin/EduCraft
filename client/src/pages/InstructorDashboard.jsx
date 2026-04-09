import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { 
  Plus, Edit, Trash2, 
  Users, DollarSign, Star, 
  BookOpen, MoreVertical, 
  Play, Zap, Layers, 
  ChevronRight, ArrowRight, ClipboardList,
  GraduationCap, TrendingUp, BarChart3,
  Search, Filter, Settings, RefreshCw,
  AlertCircle, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalRevenue: 0,
        avgRating: 0
    });
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchDashboardData = async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        try {
            const { data } = await api.get('/api/courses/instructor/my-courses');
            setCourses(data);
            
            const totalStudents = data.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0);
            const totalRevenue = data.reduce((acc, c) => acc + ((c.enrolledStudents || 0) * (c.price || 0)), 0);
            const avgRating = data.length > 0 
                ? (data.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) / data.length).toFixed(1) 
                : 0;

            setStats({ totalStudents, totalRevenue, avgRating });
            setLastUpdated(new Date());
        } catch (err) {
            if (!silent) toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
            
            // Automatic background refresh every 60 seconds
            const interval = setInterval(() => fetchDashboardData(true), 60000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const deleteCourse = async (id) => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                await api.delete(`/api/courses/${id}`);
                toast.success('Course deleted successfully');
                fetchDashboardData();
            } catch (err) {
                toast.error('Failed to delete course');
            }
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-16 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                                Instructor Dashboard
                            </span>
                        </div>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-none mb-4 uppercase">
                            Welcome back, {user?.name.split(' ')[0]}
                        </h1>
                        <p className="text-slate-400 text-xl font-medium max-w-2xl">
                            You are currently reaching <span className="text-white font-bold">{stats.totalStudents} students</span> across your courses.
                        </p>
                    </div>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <Link to="/instructor/course/create" className="bg-primary hover:bg-primary-hover text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-3">
                            <Plus size={24} /> Create New Course
                        </Link>
                        <button 
                            onClick={() => fetchDashboardData()} 
                            disabled={isRefreshing}
                            className="bg-[#1e293b] border border-slate-700 text-white h-16 w-16 md:w-auto md:px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-700 transition-all"
                            title="Refresh Statistics"
                        >
                            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                            <span className="hidden md:block">Refresh</span>
                        </button>
                    </div>
                </header>
                
                <div className="mb-10 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-[#1e293b]/50 w-fit px-4 py-2 rounded-xl border border-slate-700/50">
                    <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-primary animate-pulse' : 'bg-emerald-500'}`}></div>
                    Last synced: {lastUpdated.toLocaleTimeString()}
                </div>

                {/* Payout Verification Alert */}
                {!user?.phone && (
                    <div className="mb-12 bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-2xl shadow-amber-500/5 animate-pulse-slow">
                        <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/30">
                            <ShieldAlert className="text-amber-500" size={32} />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">Identity Verification Required</h3>
                            <p className="text-slate-400 font-medium">Please add your mobile number in <Link to="/profile" className="text-amber-500 hover:underline">Profile Settings</Link> to authorize revenue payouts and verify your professional instructor identity.</p>
                        </div>
                        <Link to="/profile" className="bg-amber-500 hover:bg-amber-600 text-[#0f172a] px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-amber-500/20">
                            Verify Now
                        </Link>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                    {[
                        { label: 'Active Courses', value: courses.length, icon: BookOpen, color: 'text-primary' },
                        { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-emerald-500' },
                        { label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500' },
                        { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-purple-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-slate-700/50 hover:border-slate-600 transition-all shadow-lg group">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 bg-[#0f172a] rounded-2xl border border-slate-700 ${stat.color} shadow-inner`}>
                                    <stat.icon size={24} />
                                </div>
                                <TrendingUp size={20} className="text-slate-700 group-hover:text-primary transition-colors" />
                            </div>
                            <h3 className="text-3xl font-extrabold text-white mb-1">{stat.value}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* My Courses Section */}
                <section>
                    <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-700/50">
                        <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">Your Courses</h2>
                        <Link to="/instructor/students" className="text-sm font-bold text-primary hover:underline flex items-center gap-2 group">
                            View All Students <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {courses.length === 0 ? (
                        <div className="bg-[#1e293b] p-24 rounded-[4rem] border-2 border-dashed border-slate-700 text-center flex flex-col items-center gap-8 shadow-inner">
                            <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center text-slate-700 border border-slate-700">
                                <Plus size={48} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-bold text-white">No courses yet</h3>
                                <p className="text-slate-400 text-lg max-w-md mx-auto">Start sharing your knowledge by creating your first professional course today.</p>
                            </div>
                            <Link to="/instructor/course/create" className="btn-primary px-12 h-16 rounded-2xl font-bold text-lg">Create Course</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {courses.map(course => (
                                <div key={course._id} className="bg-[#1e293b] border border-slate-700/50 rounded-[3rem] overflow-hidden group hover:border-slate-600 transition-all shadow-xl flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden">
                                        <img 
                                            src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-[#0f172a]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <Link to={`/instructor/course/edit/${course._id}`} title="Edit Course" className="bg-white p-4 rounded-2xl text-slate-900 hover:bg-primary hover:text-white transition-all shadow-2xl">
                                                <Edit size={20} />
                                            </Link>
                                            <button onClick={() => deleteCourse(course._id)} title="Delete Course" className="bg-white p-4 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-2xl">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className="px-4 py-1.5 bg-[#0f172a]/90 backdrop-blur-md rounded-xl text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20 shadow-lg">
                                                {course.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-6 line-clamp-1 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-700/50 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Students</p>
                                                <p className="text-lg font-bold text-white">{course.enrolledStudents || 0}</p>
                                            </div>
                                            <div className="bg-[#0f172a] p-4 rounded-2xl border border-slate-700/50 text-center">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Revenue</p>
                                                <p className="text-lg font-bold text-emerald-500">${((course.enrolledStudents || 0) * (course.price || 0)).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3 mt-auto">
                                            <Link 
                                                to={`/instructor/courses/${course._id}/lessons`} 
                                                className="w-full h-12 flex justify-center items-center gap-2 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary-hover shadow-lg shadow-primary/10 transition-all active:scale-[0.98]"
                                            >
                                                <Play size={14} fill="white" /> Manage Lessons & Videos
                                            </Link>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Link 
                                                    to={`/instructor/courses/${course._id}/quizzes`} 
                                                    className="h-12 flex justify-center items-center gap-2 bg-[#0f172a] text-slate-400 hover:text-white rounded-xl border border-slate-700 hover:border-slate-500 transition-all font-bold text-[10px] uppercase tracking-widest"
                                                >
                                                    <Zap size={14} /> Quizzes
                                                </Link>
                                                <Link 
                                                    to={`/instructor/courses/${course._id}/assignments`} 
                                                    className="h-12 flex justify-center items-center gap-2 bg-[#0f172a] text-slate-400 hover:text-white rounded-xl border border-slate-700 hover:border-slate-500 transition-all font-bold text-[10px] uppercase tracking-widest"
                                                >
                                                    <ClipboardList size={14} /> Assignments
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Footer Info */}
                                        <div className="mt-8 pt-6 border-t border-slate-700/50 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <Layers size={14} className="text-primary" />
                                                <span>{course.videos?.length || 0} Lessons</span>
                                            </div>
                                            <Link to={`/course/${course._id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 group/preview">
                                                Preview <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default InstructorDashboard;
