import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { 
  BookOpen, Award, Play, 
  CheckCircle, HelpCircle, 
  ChevronRight, Calendar,
  GraduationCap, Target,
  Layers, Zap, Cpu, ShieldCheck,
  FileText, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const MyCourses = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEnrollments = async () => {
            try {
                const { data } = await api.get('/api/users/enrollments');
                setEnrollments(data.filter(e => e.course != null));
            } catch (error) {
                toast.error('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                            Student Portal
                        </span>
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">My Learning</h1>
                    <p className="text-slate-400 text-lg">Tracks your course progress and achievements. Continue where you left off.</p>
                </header>

                {enrollments.length === 0 ? (
                    <div className="bg-[#1e293b] p-24 rounded-[3rem] border border-dashed border-slate-700 text-center flex flex-col items-center gap-8 shadow-inner">
                        <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center text-slate-700 border border-slate-700">
                            <BookOpen size={48} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-4">No active courses</h2>
                            <p className="text-slate-400 text-lg max-w-md mx-auto">Explore our catalog of professional courses to begin your learning journey.</p>
                        </div>
                        <Link to="/courses" className="btn-primary px-12 h-16 rounded-2xl font-bold text-lg">Explore Courses</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {enrollments.map((enrollment) => {
                            const { course } = enrollment;
                            const isComplete = enrollment.progress === 100;
                            const hasPassed = enrollment.progress === 100 && (!course.quizzes?.length || enrollment.passedQuiz);
                            const needsQuiz = isComplete && course.quizzes?.length > 0 && !enrollment.passedQuiz;

                            return (
                                <div key={enrollment._id} className="bg-[#1e293b] border border-slate-700/50 rounded-[2.5rem] overflow-hidden group hover:border-slate-600 transition-all shadow-xl flex flex-col">
                                    {/* Thumbnail */}
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img 
                                            src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop'} 
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-[#0f172a]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                onClick={() => navigate(`/course/${course._id}`)}
                                                className="bg-primary p-5 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-all active:scale-95"
                                            >
                                                <Play size={28} fill="currentColor" className="text-white ml-1" />
                                            </button>
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 ${
                                                hasPassed 
                                                ? 'bg-emerald-500 text-white animate-pulse-slow' 
                                                : needsQuiz 
                                                ? 'bg-amber-500 text-white' 
                                                : 'bg-primary text-white'
                                            }`}>
                                                {hasPassed ? 'Award Available' : needsQuiz ? 'Take Quiz' : 'In Progress'}
                                                {hasPassed && <Award size={14} className="animate-bounce" />}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="text-xl font-bold text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        
                                        <div className="flex items-center gap-2 mb-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            <GraduationCap size={16} className="text-primary" />
                                            <span>Instructor: <span className="text-white">{course.instructor?.name || 'Authorized AI'}</span></span>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-auto bg-[#0f172a] p-6 rounded-2xl border border-slate-700/50 space-y-3">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                                                <span className="text-slate-500">Course Progress</span>
                                                <span className={isComplete ? 'text-emerald-500' : 'text-primary'}>
                                                    {enrollment.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                                                    style={{ width: `${enrollment.progress}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                <span>{enrollment.completedVideos?.length || 0} Lessons</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} /> {course.videos?.length || 0} Total
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-8">
                                            {hasPassed ? (
                                                <Link to={`/certificate/${course._id}`} className="w-full h-14 flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]">
                                                    <Award size={20} /> Certificate Hub
                                                </Link>
                                            ) : needsQuiz ? (
                                                <Link to={`/quiz/${course._id}`} className="w-full h-14 flex items-center justify-center gap-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] animate-pulse">
                                                    <HelpCircle size={20} /> Take Final Quiz
                                                </Link>
                                            ) : (
                                                <Link to={`/course/${course._id}`} className="w-full h-14 flex items-center justify-center gap-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                                    <Play size={20} fill="white" /> Resume Learning
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
