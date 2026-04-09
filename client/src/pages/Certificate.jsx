import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  Download, Award, ShieldCheck, 
  ChevronLeft, Printer, Share2,
  Globe, Zap, Cpu, GraduationCap,
  Target, CheckCircle2
} from 'lucide-react';

const Certificate = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data: enrollments } = await axios.get('http://localhost:5000/api/users/enrollments', config);
                const targetEnrollment = enrollments.find(e => e.course?._id === id);
                
                if (!targetEnrollment) {
                    setError('Access Denied: Enrollment record not found.');
                    setLoading(false);
                    return;
                }

                if (targetEnrollment.progress < 100) {
                    setError('Course Incomplete: You must finish all lessons to earn this certificate.');
                    setLoading(false);
                    return;
                }

                if (targetEnrollment.course?.quizzes?.length > 0 && !targetEnrollment.passedQuiz) {
                    setError('Quiz Required: You must pass the final quiz to earn this certificate.');
                    setLoading(false);
                    return;
                }

                setEnrollment(targetEnrollment);
                setCourse(targetEnrollment.course);
                setLoading(false);
            } catch (err) {
                setError('Error: Failed to retrieve certificate data.');
                setLoading(false);
            }
        };

        if (user) fetchCertificateData();
    }, [id, user]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center gap-6 text-center px-4">
            <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-extrabold text-white uppercase tracking-tight">{error}</h2>
            <Link to="/my-courses" className="btn-primary h-14 px-10 rounded-2xl flex items-center justify-center mt-4">Return to My Courses</Link>
        </div>
    );

    const completionDate = new Date(enrollment.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in px-4">
            <div className="max-w-6xl mx-auto pt-10">
                {/* Control Bar */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-center gap-8 print:hidden">
                    <div className="flex items-center gap-6">
                        <Link to="/my-courses" className="p-4 bg-[#1e293b] rounded-2xl border border-slate-700 text-slate-400 hover:text-white transition-all shadow-xl">
                            <ChevronLeft size={24} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Verified Certificate</span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-white uppercase tracking-tight">Course Certificate</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success('Certificate link copied!');
                        }} className="bg-[#1e293b] border border-slate-700 text-slate-400 hover:text-white h-14 w-14 flex items-center justify-center rounded-2xl transition-all shadow-xl">
                            <Share2 size={20} />
                        </button>
                        <button onClick={handlePrint} className="btn-primary h-14 px-8 rounded-2xl flex items-center gap-3 font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                            <Printer size={18} /> Print Certificate
                        </button>
                    </div>
                </header>

                {/* Certificate Render Area */}
                <div className="relative flex justify-center mb-10 overflow-x-auto print:overflow-visible">
                    <div 
                        ref={certificateRef}
                        className="relative bg-[#ffffff] text-[#0f172a] p-16 md:p-20 shadow-2xl overflow-hidden aspect-[1.414/1] flex flex-col items-center justify-between text-center border-[16px] border-[#0f172a]"
                        style={{ 
                            width: '297mm',
                            height: '210mm',
                            maxWidth: '100%',
                            minWidth: '800px',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Decorative Background for Print-Friendly (Light Theme) */}
                        <div className="absolute inset-4 border-2 border-[#0f172a]/10 pointer-events-none"></div>
                        <div className="absolute inset-8 border border-[#0f172a]/5 pointer-events-none"></div>
                        
                        {/* Watermark Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                            <Award size={600} />
                        </div>

                        {/* Top Section */}
                        <div className="relative z-10 w-full flex justify-between items-start mb-4">
                            <div className="flex flex-col items-start gap-1">
                                <div className="bg-[#0f172a] text-white px-4 py-2 text-xs font-black tracking-[0.2em] uppercase">EduCraft</div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Verified ID: {id.slice(-12).toUpperCase()}</span>
                            </div>
                            <div className="w-24 h-24 text-[#0f172a]">
                                <Award size={96} strokeWidth={1} />
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-center">
                            <h3 className="text-sm font-black text-[#0f172a]/40 uppercase tracking-[0.5em] mb-8">Certificate of Completion</h3>
                            
                            <p className="text-xl font-serif italic text-slate-500 mb-6">This document officially certifies that</p>
                            
                            <h2 className="text-6xl md:text-7xl font-bold text-[#0f172a] tracking-tight uppercase mb-8 underline decoration-1 underline-offset-8">
                                {user.name}
                            </h2>
                            
                            <p className="text-lg font-serif italic text-slate-500 mb-8">has successfully fulfilled all requirements and demonstrated mastery in</p>
                            
                            <h3 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] uppercase tracking-tight mb-12">
                                {course.title}
                            </h3>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 rounded-full border border-slate-200">
                                    <CheckCircle2 size={16} className="text-emerald-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Authenticated Platform</span>
                                </div>
                                <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 rounded-full border border-slate-200">
                                    <ShieldCheck size={16} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#0f172a]">Verified Instructor</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Section */}
                        <div className="relative z-10 w-full grid grid-cols-3 gap-12 items-end mt-12 border-t-2 border-[#0f172a]/5 pt-8">
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date of Achievement</span>
                                <div className="text-lg font-bold text-[#0f172a] border-b border-[#0f172a]/20 w-32 pb-1">
                                    {completionDate}
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 opacity-20 mb-2">
                                    <Globe size={64} strokeWidth={1} />
                                </div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Global Academic Standard</span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Authorized Instructor</span>
                                <div className="relative w-full max-w-[200px] h-16 flex items-center justify-center border-b border-[#0f172a]/20">
                                    <img 
                                        src="http://localhost:5000/uploads/signatures/instructor_signature.png" 
                                        alt="Instructor Signature"
                                        className="h-12 object-contain contrast-150 brightness-75 mix-blend-multiply"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'block';
                                        }}
                                    />
                                    <div className="hidden text-3xl font-bold text-[#0f172a] italic" style={{ fontFamily: "'Dancing Script', cursive" }}>
                                        {course.instructor?.name || 'Authorized Lead'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        nav, header, .print:hidden, .toast, button {
                            display: none !important;
                        }
                        body {
                            background: white !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .aspect-[1.414/1] {
                            width: 297mm !important;
                            height: 210mm !important;
                            border: none !important;
                            box-shadow: none !important;
                            position: absolute !important;
                            top: 0 !important;
                            left: 0 !important;
                            margin: 0 !important;
                            padding: 20mm !important;
                        }
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default Certificate;
