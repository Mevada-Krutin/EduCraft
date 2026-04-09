import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { 
  BookOpen, Users, Star, 
  ArrowRight, Sparkles, Shield, 
  Cpu, Globe, Zap, CheckCircle2
} from 'lucide-react';
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
                setCourses(data.courses || []);
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
        <div className="flex flex-col gap-32 pb-32 bg-bg-main">
            
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full animate-pulse-slow animation-delay-2000"></div>
                
                <div className="container-wide relative z-10 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white border border-slate-200 mb-10 shadow-sm animate-in">
                        <Sparkles size={16} className="text-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Intelligence-First Learning Node</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9] max-w-5xl animate-in delay-100 italic">
                        <span className="text-text-primary">EVOLVE YOUR</span><br />
                        <span className="text-gradient">SYSTEM LOGIC</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mb-14 animate-in delay-200 leading-relaxed font-medium">
                        EduCraft Core 2.0 provides the architecture for professional mastery. 
                        Deploy world-class curricula and validate your cognitive assets.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 animate-in delay-300">
                        <button
                            className="btn-primary h-20 px-12 rounded-[2.5rem] text-sm font-black uppercase tracking-widest flex items-center gap-4 group"
                            onClick={handleGetStarted}
                            disabled={actionLoading}
                        >
                            {actionLoading ? 'Initializing...' : (
                                <>
                                    Initialize Core Access <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                        <button
                            className="bg-white border border-slate-200 h-20 px-12 rounded-[2.5rem] text-sm font-black uppercase tracking-widest text-text-primary hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                            onClick={() => navigate('/courses')}
                        >
                            Explore Intelligence Matrix
                        </button>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-32 mt-32 animate-in delay-500">
                        {[
                            { label: 'Latency', value: '12ms' },
                            { label: 'Uptime', value: '99.9%' },
                            { label: 'Active Nodes', value: '2.4k' },
                            { label: 'Throughput', value: 'High' }
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <span className="text-4xl font-black text-text-primary tracking-tighter">{stat.value}</span>
                                <div className="h-1 w-8 bg-primary/20 rounded-full my-2"></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Protocols (Features) */}
            <section className="container-wide">
                <div className="flex flex-col items-center text-center mb-20">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4">Core Competencies</span>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary mb-8">CORE PROTOCOLS</h2>
                    <div className="w-24 h-1.5 bg-primary/10 rounded-full relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary w-1/3 animate-shimmer"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        {
                            icon: Cpu,
                            title: "Systemic Mastery",
                            desc: "Recursive learning algorithms designed for long-term retention and rapid deployment of skills."
                        },
                        {
                            icon: Globe,
                            title: "Global Grid",
                            desc: "Connect with a planetary network of intelligence collectors and industry architects."
                        },
                        {
                            icon: Shield,
                            title: "Proof of Knowledge",
                            desc: "Verifiable credentials anchored in professional-grade assessment metrics."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="card-premium group flex flex-col gap-8">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-700 shadow-inner">
                                <feature.icon size={36} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight">{feature.title}</h3>
                                <p className="text-text-secondary text-base leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                            <div className="mt-auto pt-6 flex items-center gap-3 text-primary font-black uppercase text-[10px] tracking-widest group-hover:gap-5 transition-all">
                                Protocol Details <ArrowRight size={16} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Intelligence Matrix (Course Listing) */}
            <section className="container-wide">
                <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 px-4">
                    <div>
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Deployment Buffer</span>
                        <h2 className="text-5xl md:text-6xl font-black tracking-tight text-text-primary">INTELLIGENCE MATRIX</h2>
                    </div>
                    <button 
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-4 px-8 py-4 bg-white border border-slate-200 rounded-[2rem] text-[10px] font-black uppercase tracking-widest text-text-primary hover:text-primary hover:border-primary/30 transition-all group shadow-sm"
                    >
                        View Full Dataset <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] rounded-[3rem] bg-slate-100 animate-pulse border border-slate-200"></div>
                        ))}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 mx-4">
                        <Zap size={60} className="mx-auto mb-8 text-slate-200" />
                        <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">No Active Modules</h3>
                        <p className="text-slate-400 mt-3 font-medium italic">System standby. Check back later for dataset updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4 italic">
                        {courses.slice(0, 6).map(course => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                )}
            </section>

            {/* Global CTA */}
            <section className="container-wide">
                <div className="relative rounded-[4rem] overflow-hidden p-16 md:p-32 bg-slate-900 group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                    <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 blur-[140px] rounded-full rotate-12"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto gap-12">
                        <div className="w-24 h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center shadow-2xl animate-pulse-slow">
                            <CheckCircle2 size={48} className="text-white" />
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none italic">
                            READY TO INITIALIZE YOUR PROFESSIONAL ENGINE?
                        </h2>
                        <p className="text-xl text-white/70 font-medium leading-relaxed">
                            Join the next generation of architects, engineers, and creatives building on the EduCraft Core protocol.
                        </p>
                        <button 
                            className="h-20 px-16 bg-white text-slate-900 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                            onClick={() => navigate('/login')}
                        >
                            Deploy Identity Matrix
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
