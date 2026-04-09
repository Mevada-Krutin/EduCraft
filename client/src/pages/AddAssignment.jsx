import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Plus, ClipboardList, Calendar, 
  Target, ArrowLeft, FileText,
  AlertCircle, Layout, Save,
  CheckCircle, ArrowUpRight
} from 'lucide-react';

const AddAssignment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [totalPoints, setTotalPoints] = useState(100);
    
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [assignments, setAssignments] = useState([]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/api/courses/${id}`);
            setCourseTitle(data.title);
            setAssignments(data.assignments || []);
        } catch (err) {
            toast.error('Strategic Asset Recovery Failed');
            navigate('/instructor/dashboard');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id, navigate]);

    const handleAddAssignment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post(`/api/courses/${id}/assignments`, { 
                title, 
                description, 
                dueDate, 
                totalPoints 
            });
            toast.success('Project parameters integrated successfully.');
            
            // Reset form
            setTitle('');
            setDescription('');
            setDueDate('');
            setTotalPoints(100);
            
            fetchCourse();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Integration Failed');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="font-black uppercase tracking-[0.2em] text-sm text-primary mb-2">Syncing Project Data</p>
                    <p className="text-text-muted italic">Identifying pedagogical targets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fade-up pt-14 md:pt-20 pb-20 px-4">
            {/* Header */}
            <header className="mb-16">
                <button 
                    onClick={() => navigate('/instructor/dashboard')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-all mb-8 text-[10px] font-black uppercase tracking-[0.3em] group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
                </button>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                                <ClipboardList size={18} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Assessment Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">Project Deployment</h1>
                        <p className="text-text-secondary text-xl mt-4 font-medium leading-relaxed">
                            Defining tactical objectives and verification parameters for: <span className="text-white font-black">{courseTitle}</span>
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Form Section */}
                <div className="lg:col-span-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        
                        {/* New Assignment Form */}
                        <div className="lg:col-span-5 order-2 lg:order-1 sticky top-6">
                            <div className="glass-morphism p-10 rounded-[3rem] border border-white/5 shadow-2xl">
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                                        <Plus size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Deploy Module</h3>
                                </div>
                                
                                <form onSubmit={handleAddAssignment} className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                                            <Layout size={12} className="text-primary" /> Objective Title
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Advanced System Architecture Design"
                                            className="input-premium" 
                                            value={title} 
                                            onChange={(e) => setTitle(e.target.value)} 
                                            required 
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                                            <FileText size={12} className="text-primary" /> Tactical Brief (Description)
                                        </label>
                                        <textarea 
                                            placeholder="Provide detailed instructions for completion..."
                                            className="w-full bg-slate-50 border border-border min-h-[160px] p-6 rounded-2xl text-text-primary focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none font-medium"
                                            value={description} 
                                            onChange={(e) => setDescription(e.target.value)} 
                                            required 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                                                <Calendar size={12} className="text-primary" /> Termination Date
                                            </label>
                                            <input 
                                                type="date" 
                                                className="input-premium" 
                                                value={dueDate} 
                                                onChange={(e) => setDueDate(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-2">
                                                <Target size={12} className="text-primary" /> Power Score
                                            </label>
                                            <input 
                                                type="number" 
                                                className="input-premium" 
                                                value={totalPoints} 
                                                onChange={(e) => setTotalPoints(Number(e.target.value))} 
                                                required 
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="btn btn-primary h-20 w-full rounded-[2rem] shadow-2xl shadow-primary/20 flex justify-center items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {loading ? (
                                            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Save size={20} /> Integrate Project
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Assignments List */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="flex justify-between items-center mb-10 px-2">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-4">
                                    <ClipboardList className="text-primary" /> Deployed Modules
                                </h3>
                                <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                                    {assignments.length} Strategic Units
                                </span>
                            </div>
                            
                            {assignments.length === 0 ? (
                                <div className="glass-morphism border-dashed border-white/10 flex flex-col items-center justify-center py-32 text-center gap-6 rounded-[3rem] bg-white/[0.02]">
                                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-white/10">
                                        <ClipboardList size={48} />
                                    </div>
                                    <p className="text-text-muted italic max-w-xs font-medium">Assigned vectors are currently at zero state. Initiate deployment to the left.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {assignments.map((assignment, idx) => (
                                        <div key={idx} className="glass-morphism group hover:border-primary/40 border-white/5 flex flex-col p-8 bg-white/[0.03] transition-all relative overflow-hidden rounded-[2.5rem]">
                                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-black text-xl shadow-inner group-hover:bg-primary/10 transition-all">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-black text-white group-hover:text-primary transition-colors mb-2 uppercase tracking-tight">{assignment.title}</h4>
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                                <Calendar size={12} className="text-primary/60" /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-text-muted bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                                <Target size={12} className="text-primary/60" /> {assignment.totalPoints} Power Points
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                                                    View Submissions <ArrowUpRight size={14} />
                                                </button>
                                            </div>
                                            <p className="mt-8 text-text-secondary text-sm font-medium leading-relaxed italic border-t border-white/5 pt-6">
                                                {assignment.description.substring(0, 150)}{assignment.description.length > 150 ? '...' : ''}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddAssignment;
