import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import VideoPlayer from '../components/VideoPlayer';
import CourseQuiz from '../components/CourseQuiz';
import CourseReviews from '../components/CourseReviews';
import { 
  PlayCircle, CheckCircle, 
  ChevronRight, GraduationCap, 
  Lock, Clock, Award, 
  Info, Share2, Heart,
  Users, Shield, Sparkles,
  Play, Box, LayoutPanelLeft,
  ClipboardList, Calendar, Target as TargetIcon,
  Star
} from 'lucide-react';
import Confetti from 'react-confetti';
import toast from 'react-hot-toast';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useContext(AuthContext); // Added updateUser

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enrolling, setEnrolling] = useState(false);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [activeVideo, setActiveVideo] = useState(null);
    const [completedVideos, setCompletedVideos] = useState([]);
    const [courseProgress, setCourseProgress] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [submittingAssignment, setSubmittingAssignment] = useState(null);
    const [assignmentContent, setAssignmentContent] = useState('');

    // Phone Isolation System
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [phoneInput, setPhoneInput] = useState('');
    const [isSavingPhone, setIsSavingPhone] = useState(false);

    useEffect(() => {
        const fetchCourseAndEnrollment = async () => {
            try {
                const { data } = await api.get(`/api/courses/${id}`);
                setCourse(data);
                if (data.videos && data.videos.length > 0) {
                    setActiveVideo(data.videos[0]);
                }

                if (user) {
                    const enrollmentsRes = await api.get('/api/users/enrollments');
                    const enrolled = enrollmentsRes.data.find(e => e.course?._id === id);
                    if (enrolled) {
                        setIsEnrolled(true);
                        setCompletedVideos(enrolled.completedVideos || []);
                        setCourseProgress(enrolled.progress || 0);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load course details');
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

        if (isEnrolled || enrolling) return;

        // Check if course is free or premium
        if (course.price > 0 && user.role !== 'admin') {
            // ELITE ISOLATION CHECK: If student has no phone, force collection first
            if (!user.phone) {
                setShowPhoneModal(true);
                return;
            }
            initiatePayment();
            return;
        }

        // ADMIN OR FREE COURSE: Direct Enrollment
        setEnrolling(true);
        try {
            await api.post('/api/users/enroll', { courseId: id });
            setIsEnrolled(true);
            toast.success(user.role === 'admin' ? 'Admin Access Granted: Enrollment Bypassed.' : 'Course Enrolled. Welcome to the module.');
            setEnrolling(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Enrollment Failed');
            setEnrolling(false);
        }
    };

    const initiatePayment = async () => {
        setEnrolling(true);
        try {
            // 1. Get Razorpay Key
            const { data: keyRes } = await api.get('/api/razorpay/key');
            
            // 2. Create Order
            const { data: order } = await api.post('/api/razorpay/order', { courseId: id });
            
            // 3. Open Razorpay Modal
            const options = {
                key: keyRes.key,
                amount: order.amount,
                currency: order.currency,
                name: "EduCraft Core",
                description: `Enrollment for ${course.title}`,
                image: "https://cdn-icons-png.flaticon.com/512/3135/3135810.png",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        const verifyRes = await api.post('/api/razorpay/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            courseId: id
                        });

                        if (verifyRes.data.success) {
                            setIsEnrolled(true);
                            toast.success('Payment Successful! Access Granted.');
                            // Trigger confetti for premium student
                            setShowConfetti(true);
                            setTimeout(() => setShowConfetti(false), 8000);
                        }
                    } catch (err) {
                        toast.error('Payment verification failed.');
                    } finally {
                        setEnrolling(false);
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || '', // Forces Razorpay to use the correct student number
                },
                theme: {
                    color: "#2563eb",
                },
                modal: {
                    ondismiss: () => setEnrolling(false)
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment Initialization Failed');
            setEnrolling(false);
        }
    };

    const handleMarkComplete = async (videoId) => {
        if (!user) return;
        try {
            const { data } = await api.post(`/api/users/enrollments/${id}/progress`, { videoId });
            setCompletedVideos(data.completedVideos || []);
            setCourseProgress(data.progress || 0);

            if (data.progress === 100) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000);
            }
            toast.success('Lesson completed.');
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    };

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        if (phoneInput.length < 10) {
            toast.error('Please enter a valid mobile number.');
            return;
        }

        setIsSavingPhone(true);
        try {
            const { data } = await api.put('/api/users/profile', { phone: phoneInput });
            updateUser(data); // Sync local state
            setShowPhoneModal(false);
            toast.success('Contact verified! Opening payment...');
            
            // Automatically trigger payment now that we have the ID
            setTimeout(() => initiatePayment(), 500);
        } catch (err) {
            toast.error('Failed to save contact info.');
        } finally {
            setIsSavingPhone(false);
        }
    };

    const [activeTab, setActiveTab] = useState('curriculum'); 
    const handleAssignmentSubmit = async (assignmentId) => {
        if (!assignmentContent.trim()) {
            toast.error('Response Required: Content cannot be empty.');
            return;
        }

        setSubmittingAssignment(assignmentId);
        try {
            await api.post(`/api/courses/${id}/assignments/${assignmentId}/submit`, { 
                content: assignmentContent 
            });
            toast.success('Assignment submitted successfuly.');
            setAssignmentContent('');
            setSubmittingAssignment(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Submission Failed');
            setSubmittingAssignment(null);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
             <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-10">
            <div className="bg-[#1e293b] p-12 rounded-[2rem] border border-red-500/20 text-center max-w-lg">
                <h2 className="text-red-500 font-bold text-3xl mb-4">ACCESS DENIED</h2>
                <p className="text-slate-400 text-lg mb-8">{error}</p>
                <Link to="/courses" className="btn-primary">Browse Other Courses</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
            
            {/* Hero Section */}
            <div className="bg-[#1e293b] border-b border-slate-700/50 pt-12 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl">
                        <span className="badge-blue mb-6 inline-block">{course.category}</span>
                        <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 uppercase">
                            {course.title || 'Course Title'}
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-3xl">
                            {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-8 text-slate-300">
                            <div className="flex items-center gap-2">
                                <Users size={20} className="text-primary" />
                                <span className="text-sm font-bold">Instructor: <span className="text-white">{course.instructor?.name || 'Authorized Instructor'}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <PlayCircle size={20} className="text-primary" />
                                <span className="text-sm font-bold">{course.videos?.length || 0} Lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-primary" />
                                <span className="text-sm font-bold">{course.level || 'Beginner'}</span>
                            </div>
                        </div>
                        
                        {/* Pricing and Enrollment Bar */}
                        <div className="mt-12 bg-[#0f172a]/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="text-4xl font-black text-white">
                                {course.price ? `$${course.price}` : 'FREE'}
                            </div>
                            {!isEnrolled ? (
                                <button 
                                    onClick={handleEnroll} 
                                    disabled={enrolling}
                                    className="btn-primary h-14 px-12 text-lg w-full sm:w-auto"
                                >
                                    {enrolling ? 'Enrolling...' : 'Enroll in Course'}
                                </button>
                            ) : (
                                <div className="flex items-center gap-3 text-emerald-500 font-bold px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle size={20} /> ENROLLED
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Content Projection (Left/Main) */}
                    <div className="flex-1 w-full">
                        
                        {/* Tab Navigation System (If Enrolled) */}
                        {isEnrolled && (
                            <div className="flex bg-[#1e293b] p-1.5 rounded-2xl border border-slate-700/50 mb-10">
                                {[
                                    { id: 'curriculum', label: 'Curriculum', icon: LayoutPanelLeft },
                                    { id: 'assignments', label: 'Assignments', icon: ClipboardList },
                                    { id: 'quiz', label: 'Validation', icon: TargetIcon }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                            activeTab === tab.id 
                                            ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                        }`}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Rendering View */}
                        <div className="mb-12">
                            {isEnrolled ? (
                                activeTab === 'quiz' ? (
                                    <CourseQuiz 
                                        courseId={course._id} 
                                        quizzes={course.quizzes} 
                                        token={user.token} 
                                        onPass={() => {
                                            setShowConfetti(true);
                                            setTimeout(() => setShowConfetti(false), 8000);
                                            toast.success('Course module completed successfully.');
                                        }}
                                    />
                                ) : activeTab === 'assignments' ? (
                                    <div className="space-y-8 fade-in">
                                        <h2 className="text-2xl font-bold text-white mb-6 uppercase">Course Assignments</h2>
                                        {course.assignments && course.assignments.length > 0 ? (
                                            course.assignments.map((assignment, idx) => (
                                                <div key={idx} className="bg-[#1e293b] p-8 rounded-[1.5rem] border border-slate-700/50">
                                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 pb-6 border-b border-slate-700/30">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white mb-1">{assignment.title}</h3>
                                                            <div className="flex gap-4">
                                                                <span className="text-[10px] font-bold text-primary flex items-center gap-1.5 uppercase tracking-widest">
                                                                    <Calendar size={12} /> Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                                                                </span>
                                                                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1.5 uppercase tracking-widest">
                                                                    <Award size={12} /> {assignment.totalPoints} Points
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-400 text-lg mb-8 leading-relaxed italic">{assignment.description}</p>
                                                    
                                                    <div className="space-y-4">
                                                        <textarea 
                                                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-6 min-h-[140px] text-white focus:border-primary/50 outline-none"
                                                            placeholder="Type your response here..."
                                                            value={submittingAssignment === assignment._id ? assignmentContent : ''}
                                                            onChange={(e) => {
                                                                setSubmittingAssignment(assignment._id);
                                                                setAssignmentContent(e.target.value);
                                                            }}
                                                        />
                                                        <button 
                                                            onClick={() => handleAssignmentSubmit(assignment._id)}
                                                            className="btn-primary w-full sm:w-auto px-8"
                                                        >
                                                            {submittingAssignment === assignment._id ? 'Submitting...' : 'Submit Assignment'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-20 bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] text-center italic text-slate-500">
                                                No assignments found for this course.
                                            </div>
                                        )}
                                    </div>
                                ) : activeVideo ? (
                                    <div className="space-y-8 fade-in">
                                        <div className="rounded-[2.5rem] overflow-hidden border border-slate-700/50 shadow-2xl bg-black aspect-video relative">
                                            <VideoPlayer
                                                videoUrl={activeVideo.url}
                                                title={activeVideo.title}
                                                onMarkComplete={() => handleMarkComplete(activeVideo._id)}
                                                isCompleted={completedVideos.includes(activeVideo._id)}
                                            />
                                        </div>
                                        <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-slate-700/50 shadow-sm">
                                            <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{activeVideo.title}</h3>
                                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Lesson Module</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-video rounded-[2rem] bg-[#1e293b] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-20 text-center gap-6">
                                        <Info size={48} className="text-slate-600" />
                                        <p className="text-slate-400 text-lg italic">Select a lesson from the curriculum to begin.</p>
                                    </div>
                                )
                            ) : (
                                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-700 group shadow-2xl">
                                    {course.previewVideo ? (
                                        <VideoPlayer
                                            videoUrl={course.previewVideo}
                                            title="Course Preview"
                                            onMarkComplete={() => {}}
                                            isCompleted={false}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center bg-[#1e293b]/40 backdrop-blur-sm">
                                            <div className="bg-[#0f172a] p-8 rounded-full mb-8 border border-white/5 shadow-2xl">
                                                <Lock size={48} className="text-primary animate-pulse" />
                                            </div>
                                            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 uppercase">Course Preview</h2>
                                            <p className="text-slate-400 text-lg max-w-md mb-10 leading-relaxed font-medium">
                                                Enroll now to gain access to all <span className="text-white font-bold">{course.videos?.length || 0} lessons</span> and assignments.
                                            </p>
                                            <button onClick={handleEnroll} disabled={enrolling} className="btn-primary h-14 px-12">
                                                {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <section className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-700/50">
                            <h2 className="text-2xl font-bold text-white uppercase tracking-tight mb-8">Course Description</h2>
                            <div className="text-slate-400 leading-relaxed text-lg mb-12">
                                {course.description}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-[#0f172a]/50 rounded-2xl border border-slate-700/50">
                                {[
                                    { icon: Users, value: course.enrolledStudents || 120, label: 'Enrolled' },
                                    { icon: Shield, value: 'Full Access', label: 'Access' },
                                    { icon: Award, value: 'Certificate', label: 'Reward' },
                                    { icon: Star, value: course.rating || '4.8', label: 'Rating' }
                                ].map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center text-center gap-1 group">
                                        <stat.icon className="mb-2 text-primary" size={20} />
                                        <p className="text-lg font-bold text-white uppercase">{stat.value}</p>
                                        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="mt-12">
                            <CourseReviews 
                                courseId={course._id}
                                reviews={course.reviews || []}
                                rating={course.rating || 0}
                                numReviews={course.numReviews || 0}
                                isEnrolled={isEnrolled}
                                user={user}
                                onReviewAdded={() => {
                                    api.get(`/api/courses/${id}`).then(res => setCourse(res.data));
                                }}
                            />
                        </div>
                    </div>

                    {/* Sidebar Area (Curriculum) */}
                    <aside className="lg:w-96 w-full space-y-8">
                        <div className="bg-[#1e293b] border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl sticky top-24">
                            <div className="p-8 border-b border-slate-700/50">
                                <h3 className="text-sm font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-white">
                                    <LayoutPanelLeft size={18} className="text-primary" /> Course Content
                                </h3>
                            </div>

                            <div className="max-h-[600px] overflow-y-auto">
                                {course.videos && course.videos.length > 0 ? (
                                    course.videos.map((video, index) => (
                                        <div
                                            key={video._id || index}
                                            onClick={() => isEnrolled && setActiveVideo(video)}
                                            className={`px-8 py-5 flex gap-4 transition-all border-l-4 group cursor-pointer ${
                                                activeVideo?._id === video._id 
                                                ? 'bg-primary/10 border-l-primary' 
                                                : 'border-l-transparent hover:bg-slate-800'
                                            }`}
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors shrink-0">
                                                {completedVideos.includes(video._id) ? (
                                                    <CheckCircle size={18} className="text-emerald-500" />
                                                ) : (
                                                    <span className="text-sm font-bold">{index + 1}</span>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`text-sm font-bold mb-1 line-clamp-1 ${activeVideo?._id === video._id ? 'text-white' : 'text-slate-400'}`}>
                                                    {video.title}
                                                </h4>
                                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                    <Clock size={12} /> {video.duration || 10} min
                                                </div>
                                            </div>
                                            {!isEnrolled && index > 0 && (
                                                <Lock size={14} className="text-slate-700 shrink-0 mt-1" />
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-slate-500 italic">No content available.</div>
                                )}
                            </div>

                            {isEnrolled && (
                                <div className="p-8 bg-[#0f172a]/50 border-t border-slate-700/50">
                                    {courseProgress === 100 ? (
                                        <div className="space-y-4 animate-pulse-slow">
                                            <div className="flex items-center gap-3 text-amber-400 mb-2">
                                                <Award size={20} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                                <span className="text-xs font-black uppercase tracking-widest">Achievement Unlocked</span>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-4">You've mastered this course!</h4>
                                            
                                            {/* Logic for Quiz vs Direct Claim */}
                                            {course.quizzes?.length > 0 && !completedVideos.includes('passedQuiz') ? (
                                                <button 
                                                    onClick={() => setActiveTab('quiz')}
                                                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <TargetIcon size={14} /> Pass Quiz to Claim
                                                </button>
                                            ) : (
                                                <Link 
                                                    to={`/certificate/${id}`}
                                                    className="w-full py-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 group"
                                                >
                                                    <Shield size={14} className="text-emerald-500" /> 
                                                    Download Certificate
                                                </Link>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-3">
                                                <span className="text-slate-400">Course Progress</span>
                                                <span className="text-primary">{courseProgress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${courseProgress}%` }}></div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {/* Elite Contact Isolation Modal */}
            {showPhoneModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0f172a]/90 backdrop-blur-md fade-in">
                    <div className="bg-[#1e293b] w-full max-w-md rounded-[2.5rem] border border-slate-700 p-10 shadow-3xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>
                        
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 border border-primary/20">
                                <Shield className="text-primary" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Secure Enrollment</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">Please provide your mobile number to isolate your payment identity and finalize enrollment in <span className="text-white font-bold">{course.title}</span>.</p>
                        </div>

                        <form onSubmit={handlePhoneSubmit} className="space-y-6">
                            <div className="relative group">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">+91</span>
                                <input 
                                    type="tel"
                                    placeholder="Mobile Number"
                                    className="w-full bg-[#0f172a] border border-slate-700 rounded-2xl h-16 pl-16 pr-6 text-white font-bold tracking-widest focus:border-primary outline-none transition-all"
                                    value={phoneInput}
                                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    required
                                />
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPhoneModal(false)}
                                    className="flex-1 h-16 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSavingPhone}
                                    className="flex-[2] h-16 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSavingPhone ? 'Saving...' : 'Verify & Pay'}
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </form>
                        
                        <p className="mt-8 text-[10px] text-slate-500 text-center uppercase tracking-widest flex items-center justify-center gap-2">
                            <Shield size={12} /> Data is secured with EduCraft SSL Encryption
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetail;
