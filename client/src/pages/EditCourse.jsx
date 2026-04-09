import { useState, useEffect } from 'react';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Save, Trash2, ArrowLeft, 
  BookOpen, FileText, DollarSign, 
  Tag, UploadCloud,
  Check, ChevronDown, Camera,
  RefreshCw, AlertCircle, X,
  Layout, Eye, PlayCircle, Clock,
  Layers, CheckCircle
} from 'lucide-react';

const EditCourse = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    // Hardcoded fallback categories
    const DEFAULT_CATEGORIES = [
        { _id: '1', name: 'Computer Science' },
        { _id: '2', name: 'Web Development' },
        { _id: '3', name: 'Data Science' },
        { _id: '4', name: 'Business' },
        { _id: '5', name: 'Design' },
        { _id: '6', name: 'Marketing' }
    ];

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [thumbnail, setThumbnail] = useState('');
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [previewVideo, setPreviewVideo] = useState('');
    
    const [initialLoading, setInitialLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Navigation blocker for unsaved changes
    const blocker = useBlocker(
        ({ currentValue, nextValue }) =>
            isDirty && currentValue.location.pathname !== nextValue.location.pathname
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [courseRes, categoriesRes] = await Promise.all([
                    api.get(`/api/courses/${id}`),
                    api.get('/api/categories').catch(() => ({ data: DEFAULT_CATEGORIES }))
                ]);

                const course = courseRes.data;
                setTitle(course.title);
                setDescription(course.description);
                setPrice(course.price);
                setCategory(course.category);
                setThumbnail(course.thumbnail || '');
                setPreviewVideo(course.previewVideo || '');
                setCategories(categoriesRes.data);
                
                setInitialLoading(false);
                setIsDirty(false); // Reset dirty state after initial load
            } catch (err) {
                toast.error('Failed to load course intelligence');
                navigate('/instructor/dashboard');
            }
        };
        fetchData();
    }, [id, navigate]);

    // Handle form changes to set dirty state
    const handleChange = (setter) => (e) => {
        setter(e.target.value);
        setIsDirty(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setIsDirty(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setSaveLoading(true);

        try {
            let thumbnailUrl = thumbnail;

            if (thumbnailFile) {
                const formData = new FormData();
                formData.append('media', thumbnailFile);
                
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                thumbnailUrl = uploadRes.data.url;
            }

            const courseData = { title, description, price, category, thumbnail: thumbnailUrl, previewVideo };
            await api.put(`/api/courses/${id}`, courseData);
            toast.success('Course parameters updated successfully.');
            setIsDirty(false);
            navigate('/instructor/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Strategic Update Failed');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('IRREVERSIBLE ACTION: Are you sure you want to terminate this course?')) {
            try {
                await api.delete(`/api/courses/${id}`);
                toast.success('Course objective terminated.');
                setIsDirty(false);
                navigate('/instructor/dashboard');
            } catch (err) {
                toast.error(err.response?.data?.message || 'Termination Failed');
            }
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(59,130,246,0.3)]"></div>
                <div className="text-center">
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-primary mb-2">Syncing Nexus</p>
                    <p className="text-slate-500 italic text-sm">Identifying pedagogical targets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-8 md:pt-12 pb-20">
            {/* Navigation Blockage Modal */}
            {blocker.state === "blocked" && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="glass-morphism p-10 rounded-[2.5rem] border border-white/10 max-w-md w-full shadow-2xl animate-scale-in">
                        <div className="w-16 h-16 bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-8 mx-auto">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white text-center uppercase tracking-tight mb-4">Unsaved Intelligence</h3>
                        <p className="text-slate-400 text-center font-medium leading-relaxed mb-10">
                            You have pending configuration updates. Abandoning this session will result in <span className="text-white font-bold">permanent data loss</span>.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => blocker.proceed()}
                                className="h-16 rounded-[2rem] bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all"
                            >
                                Discard & Leave
                            </button>
                            <button 
                                onClick={() => blocker.reset()}
                                className="h-16 rounded-[2rem] bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                            >
                                Stay & Sync
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cinematic Header */}
            <header className="mb-16">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                    <div className="max-w-3xl">
                        <button 
                            onClick={() => navigate('/instructor/dashboard')}
                            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-all mb-8 text-[10px] font-black uppercase tracking-[0.3em] group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Operational Hub
                        </button>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                <Layout size={18} className="text-primary" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Strategic Asset Management</span>
                            {isDirty && (
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                    <Clock size={10} /> Unsaved Changes
                                </span>
                            )}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9]">
                            Refining <span className="text-primary/50">Objectives</span>
                        </h1>
                        <p className="text-slate-400 text-xl mt-6 font-medium leading-relaxed">
                            Fine-tuning parameters for: <span className="text-white font-black">{title || 'Untitled Module'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                         <button 
                            type="button" 
                            onClick={handleDelete} 
                            className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all group relative"
                            title="Terminate Course"
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Configuration Console */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    <div className="glass-morphism p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32"></div>
                        
                        <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tight">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
                                <FileText className="text-primary" size={24} />
                            </div>
                            Intelligence Profile
                        </h3>

                        <form className="flex flex-col gap-10">
                            {/* Course Title Input */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                    <Tag size={12} className="text-primary" /> Core Objective Title
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 h-20 px-8 rounded-[1.5rem] text-xl font-bold text-white focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none" 
                                        placeholder="e.g. Advanced Quantum Computing"
                                        value={title} 
                                        onChange={handleChange(setTitle)} 
                                        required 
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary opacity-20 group-focus-within:opacity-100 transition-opacity">
                                        <BookOpen size={24} />
                                    </div>
                                </div>
                            </div>

                            {/* Description Editor (Simplified for now) */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                    <FileText size={12} className="text-primary" /> Pedagogical Brief
                                </label>
                                <textarea 
                                    className="w-full bg-white/5 border border-white/10 p-8 rounded-[1.5rem] text-lg font-medium text-slate-300 focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none min-h-[250px] leading-relaxed resize-none" 
                                    placeholder="Outline the tactical skillsets students will acquire..."
                                    value={description} 
                                    onChange={handleChange(setDescription)} 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Valuation Module */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                        <DollarSign size={12} className="text-primary" /> Resource Credit (USD)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-500">$</span>
                                        <input 
                                            type="number" 
                                            className="w-full bg-white/5 border border-white/10 h-20 pl-14 pr-8 rounded-[1.5rem] text-2xl font-black text-white focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none" 
                                            min="0" 
                                            value={price} 
                                            onChange={handleChange(setPrice)} 
                                            required 
                                        />
                                    </div>
                                </div>

                                {/* Category Matrix */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                        <Layers size={12} className="text-primary" /> Discipline Matrix
                                    </label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full bg-white/5 border border-white/10 h-20 px-8 rounded-[1.5rem] flex items-center justify-between cursor-pointer focus:border-primary/40 hover:bg-white/[0.08] transition-all"
                                        >
                                            <span className={`text-lg font-bold ${category ? 'text-white' : 'text-slate-500'}`}>
                                                {category || 'Select Discipline'}
                                            </span>
                                            <ChevronDown size={20} className={`text-slate-500 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isDropdownOpen && (
                                            <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 bg-[#0f172a] border border-white/10 rounded-[1.5rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                                                <div className="max-h-60 overflow-y-auto p-2">
                                                    {categories.map((cat) => (
                                                        <div 
                                                            key={cat._id}
                                                            onClick={() => {
                                                                setCategory(cat.name);
                                                                setIsDirty(true);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`px-6 py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-between hover:bg-primary/10 hover:text-primary ${category === cat.name ? 'bg-primary text-white' : 'text-slate-400'}`}
                                                        >
                                                            {cat.name}
                                                            {category === cat.name && <Check size={16} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Teaser Protocol */}
                            <div className="flex flex-col gap-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 flex items-center gap-2">
                                    <PlayCircle size={12} className="text-primary" /> Strategic Teaser URL (YouTube/Direct)
                                </label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        className="w-full bg-white/5 border border-white/10 h-20 px-8 rounded-[1.5rem] text-base font-medium text-slate-300 focus:border-primary/50 focus:bg-white/[0.08] transition-all outline-none" 
                                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                                        value={previewVideo} 
                                        onChange={handleChange(setPreviewVideo)} 
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/30">
                                        <Eye size={20} />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 px-2 italic">A visible intelligence sample for prospective nodes.</p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar & Verification */}
                <div className="lg:col-span-4 flex flex-col gap-8 sticky top-12">
                    
                    {/* Visual Asset Management */}
                    <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 space-y-8 animate-fade-in">
                        <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                            <Camera size={18} className="text-primary" /> Branding Core
                        </h4>
                        
                        <div className="group relative w-full aspect-video rounded-[2rem] bg-black/40 border-2 border-dashed border-white/5 hover:border-primary/40 transition-all overflow-hidden cursor-pointer shadow-inner">
                            {(thumbnailPreview || thumbnail) ? (
                                <>
                                    <img 
                                        src={thumbnailPreview || (thumbnail.startsWith('http') ? thumbnail : `http://localhost:5000${thumbnail}`)} 
                                        alt="Current Cover" 
                                        className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110" 
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <div className="p-4 bg-white text-primary rounded-full shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                                            <RefreshCw size={24} className="group-hover:rotate-180 transition-transform duration-1000" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8 text-center bg-white/[0.02]">
                                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                                        <UploadCloud size={32} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-primary transition-colors">Initialize Asset</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        
                        <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <AlertCircle size={12} /> Sync Protocol
                            </h5>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                Configuration updates propagate instantly to across the student network. Verify integrity before saving.
                            </p>
                        </div>
                    </div>

                    {/* Operational Commands */}
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleSubmit} 
                            disabled={saveLoading || !isDirty} 
                            className={`h-20 w-full rounded-[2rem] flex justify-center items-center gap-4 font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl ${
                                isDirty 
                                ? 'bg-primary text-white shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]' 
                                : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {saveLoading ? (
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save size={20} /> Deploy Configuration
                                </>
                            )}
                        </button>
                        
                        <button 
                            type="button" 
                            onClick={() => {
                                if (isDirty && !window.confirm('Discard unsaved intelligence?')) return;
                                navigate('/instructor/dashboard');
                            }}
                            className="h-16 w-full rounded-[2rem] flex justify-center items-center gap-3 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
                        >
                            <X size={18} /> Discard Protocol
                        </button>
                    </div>

                    {/* Live Statistics Projection */}
                    <div className="glass-morphism p-8 rounded-[2.5rem] border border-white/5 bg-primary/5 space-y-6">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Enrollment</span>
                            <span className="text-xl font-black text-white">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Projected Revenue</span>
                            <span className="text-xl font-black text-success">$0</span>
                        </div>
                        <div className="h-px bg-white/5"></div>
                        <div className="flex items-center gap-3 text-emerald-500/60 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                            <CheckCircle className="shrink-0" size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-tight">Objective is currently active and visible to verified students.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditCourse;
