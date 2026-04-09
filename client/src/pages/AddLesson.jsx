import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Plus, Video, Link, 
  UploadCloud, ArrowLeft, Clock,
  Play, Trash2, List,
  CheckCircle, AlertCircle, RefreshCw,
  Layout, MonitorPlay, Youtube,
  FileVideo
} from 'lucide-react';

const AddLesson = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [videoSource, setVideoSource] = useState('url'); // 'url' or 'file'
    const [videoFile, setVideoFile] = useState(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [duration, setDuration] = useState(0);
    
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [lessons, setLessons] = useState([]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/api/courses/${id}`);
            setCourseTitle(data.title);
            setLessons(data.videos || []);
        } catch (err) {
            toast.error('Failed to load course data');
            navigate('/instructor/dashboard');
        } finally {
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [id, navigate]);

    const handleAddLesson = async (e) => {
        e.preventDefault();
        
        if (videoSource === 'file' && !videoFile) {
            toast.error('Please select a video file.');
            return;
        }

        if (videoSource === 'url' && !youtubeUrl) {
            toast.error('Please enter a YouTube video URL.');
            return;
        }

        setLoading(true);

        try {
            let finalVideoUrl = youtubeUrl;

            if (videoSource === 'file') {
                const formData = new FormData();
                formData.append('media', videoFile);
                
                const uploadRes = await api.post('/api/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                finalVideoUrl = uploadRes.data.url;
            }

            await api.post(`/api/courses/${id}/lessons`, { title, url: finalVideoUrl, duration });
            toast.success('Lesson added successfully.');
            
            // Reset form
            setTitle('');
            setVideoFile(null);
            setYoutubeUrl('');
            setDuration(0);
            
            fetchCourse();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add lesson');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm('Delete this lesson?')) {
            try {
                await api.delete(`/api/courses/${id}/lessons/${lessonId}`);
                toast.success('Lesson removed.');
                fetchCourse();
            } catch (err) {
                toast.error('Failed to delete lesson.');
            }
        }
    };

    if (initialLoading) {
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
                    <button 
                        onClick={() => navigate('/instructor/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                        Course Content
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Managing lessons for: <span className="text-white font-bold">{courseTitle}</span>
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Add Lesson Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#1e293b] border border-slate-700/50 p-8 rounded-3xl sticky top-24 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Plus className="text-primary" /> New Lesson
                            </h3>
                            
                            <form onSubmit={handleAddLesson} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1">Lesson Title</label>
                                    <input 
                                        type="text" 
                                        placeholder="Introduction to..."
                                        className="w-full bg-[#0f172a] border border-slate-700 h-12 px-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        required 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1">Video Source</label>
                                    <div className="flex bg-[#0f172a] p-1 rounded-xl border border-slate-700">
                                        <button 
                                            type="button"
                                            onClick={() => setVideoSource('url')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${videoSource === 'url' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <Link size={16} /> Video Link
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setVideoSource('file')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${videoSource === 'file' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white'}`}
                                        >
                                            <UploadCloud size={16} /> Upload
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">
                                            {videoSource === 'file' ? 'Video File' : 'Video URL (YouTube/Direct)'}
                                        </label>
                                        {videoSource === 'file' ? (
                                            <div className="relative h-12 rounded-xl border border-slate-700 bg-[#0f172a] hover:border-slate-500 transition-all flex items-center px-4 cursor-pointer">
                                                <UploadCloud size={18} className="text-slate-500 mr-3" />
                                                <span className="text-sm font-medium text-slate-400 truncate">
                                                    {videoFile ? videoFile.name : 'Choose file...'}
                                                </span>
                                                <input 
                                                    type="file" 
                                                    accept="video/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    onChange={(e) => setVideoFile(e.target.files[0])} 
                                                    required={videoSource === 'file'}
                                                />
                                            </div>
                                        ) : (
                                            <input 
                                                type="url" 
                                                className="w-full bg-[#0f172a] border border-slate-700 h-12 px-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all" 
                                                placeholder="https://..."
                                                value={youtubeUrl} 
                                                onChange={(e) => setYoutubeUrl(e.target.value)} 
                                                required={videoSource === 'url'}
                                            />
                                        )}
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300 ml-1">Duration (min)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-[#0f172a] border border-slate-700 h-12 px-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 outline-none transition-all" 
                                            min="1" 
                                            value={duration} 
                                            onChange={(e) => setDuration(Number(e.target.value))} 
                                            required 
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading} 
                                    className="btn-primary w-full h-14 rounded-xl flex justify-center items-center gap-3 font-bold text-lg active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Plus size={20} /> Add Lesson
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lessons List */}
                    <div className="lg:col-span-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                <List className="text-primary" /> Lesson List
                            </h3>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest bg-slate-800 px-4 py-1.5 rounded-lg border border-slate-700">
                                {lessons.length} Lessons
                            </span>
                        </div>
                        
                        {lessons.length === 0 ? (
                            <div className="bg-[#1e293b] border border-dashed border-slate-700 rounded-[2rem] flex flex-col items-center justify-center p-20 text-center gap-6">
                                <FileVideo className="text-slate-700" size={64} />
                                <p className="text-slate-400 text-lg">No lessons added yet. Use the form to start building your course.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {lessons.map((lesson, idx) => (
                                    <div key={lesson._id || idx} className="bg-[#1e293b] border border-slate-700/50 rounded-2xl p-6 flex items-center justify-between group hover:border-slate-600 transition-all shadow-sm">
                                        <div className="flex items-center gap-6 overflow-hidden">
                                            <div className="w-12 h-12 rounded-xl bg-[#0f172a] border border-slate-700/50 flex items-center justify-center text-primary font-bold shrink-0">
                                                {idx + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-lg font-bold text-white truncate mb-1">{lesson.title}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                        <Clock size={14} /> {lesson.duration} min
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                                                    <a 
                                                        href={lesson.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="flex items-center gap-1.5 text-xs font-bold text-primary hover:underline truncate"
                                                    >
                                                        <Link size={14} /> View Source
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteLesson(lesson._id)}
                                            className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all shrink-0"
                                            title="Delete Lesson"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddLesson;
