import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { 
  Users, Mail, Book, 
  BarChart2, Search, Filter,
  ChevronRight, Calendar, CheckCircle,
  Activity, ArrowLeft, ArrowUpRight,
  ShieldCheck, Zap, Globe,
  Cpu, Target, Layers, Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const MyStudents = () => {
    const navigate = useNavigate();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const { data } = await api.get('/api/courses/instructor/students');
                setEnrollments(data);
                setLoading(false);
            } catch (error) {
                toast.error('Student Registry Access Failed');
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredEnrollments = enrollments.filter(e => 
        e.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.student?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.student?.phone && e.student.phone.includes(searchTerm)) ||
        e.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
                <p className="font-black uppercase tracking-[0.2em] text-sm text-primary mb-2">Analyzing Node Engagement</p>
                <p className="text-text-muted italic">Synthesizing intelligence registry...</p>
            </div>
        </div>
    );

    return (
        <div className="fade-up pt-14 md:pt-20 px-4 pb-20">
            <header className="mb-16">
                <button 
                    onClick={() => navigate('/instructor/dashboard')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-all mb-8 text-[10px] font-black uppercase tracking-[0.3em] group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Operational Hub
                </button>
                <div className="flex flex-col md:flex-row justify-between items-end gap-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                                <Users size={18} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Intelligence Node Registry</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">My Enrolled Students</h1>
                        <p className="text-text-secondary text-xl mt-4 font-medium leading-relaxed">Monitoring engagement velocity and saturation levels across your curriculum sequences.</p>
                    </div>
                    <div className="flex bg-[#020617] p-2 rounded-2xl border border-white/5 shadow-inner">
                        <div className="px-6 py-3 text-center border-r border-white/5">
                            <div className="text-2xl font-black text-white">{enrollments.length}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Nodes</div>
                        </div>
                        <div className="px-6 py-3 text-center">
                            <div className="text-2xl font-black text-success">{enrollments.filter(e => e.progress === 100).length}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-text-muted">Completed</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Tactical Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-6 mb-12">
                <div className="relative flex-1 group">
                    <div className="absolute inset-0 bg-primary/5 blur-xl group-focus-within:bg-primary/10 transition-all opacity-0 group-focus-within:opacity-100"></div>
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Identify subject by name, email or active sequence..."
                            className="w-full bg-white/5 border border-white/10 h-16 pl-16 pr-8 rounded-2xl text-white font-medium focus:border-primary/40 focus:bg-white/[0.08] transition-all outline-none text-sm placeholder:text-text-muted/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="btn bg-white/5 border-white/10 text-white h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all flex items-center gap-3 group">
                        <Filter size={18} className="group-hover:rotate-90 transition-transform" /> Advanced Sort
                    </button>
                    <button className="btn btn-primary h-16 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 flex items-center gap-3">
                        <Zap size={18} /> Export Intel
                    </button>
                </div>
            </div>

            {enrollments.length === 0 ? (
                <div className="glass-morphism p-32 text-center border-dashed border-white/10 rounded-[3rem]">
                    <div className="flex flex-col items-center gap-8 opacity-20">
                        <Users size={80} />
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-[0.3em] mb-2">Registry Silent</h3>
                            <p className="text-sm font-medium">Students will appear here once they authorize curriculum enrollment.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="glass-morphism p-0 rounded-[3rem] overflow-hidden border-white/5 shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/5">
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Intelligence Identity</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Target Sequence</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Contact Node</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Sync Timestamp</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Engagement level</th>
                                    <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-text-muted text-right">Node status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredEnrollments.map((enr) => (
                                    <tr key={enr._id} className="hover:bg-white/5 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:scale-110 transition-transform">
                                                    {enr.student?.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-white uppercase tracking-tight text-lg group-hover:text-primary transition-colors">{enr.student?.name}</p>
                                                    <p className="text-[10px] text-text-muted flex items-center gap-2 font-black uppercase tracking-widest mt-1 italic">
                                                        <Mail size={12} className="text-primary/50" /> {enr.student?.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3 group/course">
                                                <div className="p-2 bg-white/5 rounded-lg border border-white/5 group-hover/course:border-primary/30 transition-colors">
                                                    <Layers size={14} className="text-primary/50 group-hover/course:text-primary" />
                                                </div>
                                                <span className="text-sm font-black text-white/80 uppercase tracking-tight">{enr.course?.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                                                    <Phone size={14} className="text-emerald-500" />
                                                </div>
                                                <span className="text-sm font-black text-white/80 uppercase tracking-tight">
                                                    {enr.student?.phone ? `+91 ${enr.student.phone}` : 'NOT VERIFIED'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-white/60">
                                                    <Calendar size={14} className="text-primary/40" />
                                                    {new Date(enr.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-[9px] text-text-muted font-black uppercase tracking-widest ml-5">Registry Initialized</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col gap-3 w-56">
                                                <div className="flex justify-between items-end">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${enr.progress === 100 ? 'text-success' : 'text-primary'}`}>
                                                        Saturation: {enr.progress}%
                                                    </span>
                                                    <div className="flex gap-0.5">
                                                        {[1,2,3,4,5].map(i => (
                                                            <div key={i} className={`w-1 h-3 rounded-full ${enr.progress >= i*20 ? 'bg-primary' : 'bg-white/5'}`}></div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="h-1.5 bg-[#020617] rounded-full overflow-hidden border border-white/5 shadow-inner">
                                                    <div 
                                                        className={`h-full transition-all duration-1000 relative ${enr.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                                                        style={{ width: `${enr.progress}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            {enr.progress === 100 ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-success/10 rounded-xl border border-success/20 w-fit ml-auto">
                                                    <ShieldCheck size={12} className="text-success" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-success">Certified</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20 w-fit ml-auto">
                                                    <Activity size={12} className="text-primary animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">In Progress</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredEnrollments.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                                <Search size={40} />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Intelligence Nodes Matching Parameters</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MyStudents;
