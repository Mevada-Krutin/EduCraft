import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { 
  BookOpen, FileText, DollarSign, 
  Tag, UploadCloud, Trash2, 
  Plus, Check, ChevronDown, ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

const CreateCourse = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
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
    const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [previewVideoUrl, setPreviewVideoUrl] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/api/categories');
                if (data && data.length > 0) {
                    setCategories(data);
                    setCategory(data[0].name);
                }
            } catch (err) {
                console.warn('API Kategorien failed, using fallbacks:', err);
            }
        };
        fetchCategories();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setThumbnailPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!thumbnailFile) {
            toast.error('Please upload a course thumbnail.');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('media', thumbnailFile);
            const uploadRes = await api.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const thumbnailUrl = uploadRes.data.url;

            const courseData = { 
                title, 
                description, 
                price, 
                category, 
                thumbnail: thumbnailUrl, 
                previewVideo: previewVideoUrl,
                videos: [], 
                quizzes: [] 
            };
            
            await api.post('/api/courses', courseData);
            toast.success('Course created! Now you can add lessons.');
            navigate('/instructor/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create course');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/instructor/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4 uppercase">
                        Create New Course
                    </h1>
                    <p className="text-slate-400 text-xl font-medium max-w-2xl">
                        Standardize your educational materials and reach students worldwide.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        <div className="bg-[#1e293b] border border-slate-700/50 p-10 rounded-[2.5rem] shadow-xl space-y-10">
                            
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-white flex items-center gap-3">
                                    <BookOpen size={20} className="text-primary" /> Course Title
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Masterclass: Advanced Web Development"
                                    className="w-full bg-[#0f172a] border border-slate-700 h-16 px-6 rounded-2xl text-xl font-bold text-white placeholder:text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-lg font-bold text-white flex items-center gap-3">
                                    <FileText size={20} className="text-primary" /> Course Description
                                </label>
                                <textarea 
                                    placeholder="Explain what students will learn in this course..."
                                    className="w-full bg-[#0f172a] border border-slate-700 p-6 rounded-2xl text-lg font-medium text-slate-300 placeholder:text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[250px] leading-relaxed" 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    required 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <label className="text-lg font-bold text-white flex items-center gap-3">
                                        <DollarSign size={20} className="text-emerald-500" /> Price (USD)
                                    </label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-[#0f172a] border border-slate-700 h-16 px-6 rounded-2xl text-xl font-bold text-white focus:border-emerald-500/50 outline-none transition-all" 
                                        min="0" 
                                        value={price} 
                                        onChange={(e) => setPrice(Number(e.target.value))} 
                                        required 
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-lg font-bold text-white flex items-center gap-3">
                                        <Tag size={20} className="text-primary" /> Category
                                    </label>
                                    <div className="relative">
                                        <div 
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-full bg-[#0f172a] border border-slate-700 h-16 px-6 rounded-2xl flex items-center justify-between cursor-pointer focus:border-primary transition-all shadow-xl group"
                                        >
                                            <span className={`text-lg font-bold ${category ? 'text-white' : 'text-slate-500'}`}>
                                                {category || 'Select a Category'}
                                            </span>
                                            <ChevronDown size={20} className={`text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        {isDropdownOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    {categories.map((cat) => (
                                                        <div 
                                                            key={cat._id}
                                                            onClick={() => {
                                                                setCategory(cat.name);
                                                                setIsDropdownOpen(false);
                                                            }}
                                                            className={`px-6 py-4 text-lg font-bold transition-all cursor-pointer flex items-center justify-between hover:bg-primary/10 hover:text-primary ${category === cat.name ? 'bg-primary/5 text-primary' : 'text-slate-300'}`}
                                                        >
                                                            {cat.name}
                                                            {category === cat.name && <Check size={18} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <input type="hidden" value={category} required />
                                    </div>
                                </div>
                            </div>

                            {/* Added Preview Video URL */}
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-white flex items-center gap-3">
                                    <UploadCloud size={20} className="text-primary" /> Preview Video URL (YouTube or Direct Link)
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                                    className="w-full bg-[#0f172a] border border-slate-700 h-16 px-6 rounded-2xl text-lg font-medium text-white placeholder:text-slate-600 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all" 
                                    value={previewVideoUrl} 
                                    onChange={(e) => setPreviewVideoUrl(e.target.value)} 
                                />
                                <p className="text-xs text-slate-500 pl-2">This video will be shown as a teaser to students before they enroll.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-[2rem] shadow-lg">
                            <label className="text-md font-bold text-white mb-4 block">Course Thumbnail</label>
                            <div className="relative aspect-video rounded-2xl bg-[#0f172a] border-2 border-dashed border-slate-700 hover:border-primary/50 transition-all overflow-hidden group cursor-pointer">
                                {thumbnailPreview ? (
                                    <>
                                        <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setThumbnailFile(null); setThumbnailPreview(null); }}
                                                className="bg-red-500 text-white p-3 rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                                        <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                                            <UploadCloud size={32} />
                                        </div>
                                        <div>
                                            <p className="text-white font-bold">Pick Image</p>
                                            <p className="text-xs text-slate-500 mt-1">1280x720 Recommended</p>
                                        </div>
                                    </div>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange} />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="btn-primary h-18 w-full rounded-2xl shadow-xl shadow-primary/20 flex justify-center items-center gap-3 font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            {loading ? 'Publishing Course...' : 'Create Course'}
                        </button>
                        <p className="text-[10px] text-slate-500 mt-6 italic font-medium flex items-start gap-2">
                            <Plus size={12} className="shrink-0 mt-0.5 text-primary" /> After creation, you will be taken to the dashboard to add lessons, quizzes, and assignments.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateCourse;
