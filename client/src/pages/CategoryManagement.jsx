import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Plus, Trash2, Edit, 
  Layers, ArrowLeft, Save, 
  X, Search, Tag, 
  FileText, CornerDownRight,
  ShieldCheck, Cpu, Database,
  Zap, Globe, Activity,
  ChevronRight, ArrowRight
} from 'lucide-react';

const CategoryManagement = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/api/categories');
            setCategories(data);
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            if (isEditing) {
                await api.put(`/api/categories/${editId}`, { name, description });
                toast.success('Category updated successfully');
            } else {
                await api.post('/api/categories', { name, description });
                toast.success('New category created');
            }
            
            handleCancelEdit();
            fetchCategories();
        } catch (err) {
            toast.error('Failed to save category');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category) => {
        setName(category.name);
        setDescription(category.description);
        setIsEditing(true);
        setEditId(category._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category? This will affect all courses in this category.')) {
            try {
                await api.delete(`/api/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (err) {
                toast.error('Failed to delete category');
            }
        }
    };

    const handleCancelEdit = () => {
        setName('');
        setDescription('');
        setIsEditing(false);
        setEditId(null);
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-purple-500/10 text-purple-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-500/20">
                                    Platform Organization
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">Course Categories</h1>
                            <p className="text-slate-400 text-lg mt-2">Manage the disciplines and classifications for the entire course library.</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Category Form */}
                    <div className="lg:col-span-4 lg:sticky lg:top-10">
                        <div className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-700/50 shadow-2xl space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border border-primary/20">
                                    {isEditing ? <Edit size={24} /> : <Plus size={24} />}
                                </div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">
                                    {isEditing ? 'Edit Category' : 'Add Category'}
                                </h3>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-lg font-bold text-white ml-1">Category Name</label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. Computer Science"
                                        className="w-full bg-[#0f172a] border border-slate-700 h-16 px-6 rounded-2xl text-lg font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-inner"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-lg font-bold text-white ml-1">Description</label>
                                    <textarea 
                                        placeholder="What kind of courses go in here?"
                                        className="w-full bg-[#0f172a] border border-slate-700 p-6 rounded-2xl text-lg font-medium text-slate-300 placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-inner min-h-[160px] resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows="4"
                                    />
                                </div>

                                <div className="pt-4 flex flex-col gap-4">
                                    <button 
                                        type="submit" 
                                        disabled={submitting} 
                                        className="btn-primary h-16 rounded-2xl font-bold text-lg flex justify-center items-center gap-3 active:scale-[0.98]"
                                    >
                                        {submitting ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                {isEditing ? <Save size={24} /> : <Plus size={24} />}
                                                {isEditing ? 'Save Changes' : 'Create Category'}
                                            </>
                                        )}
                                    </button>
                                    {isEditing && (
                                        <button 
                                            type="button" 
                                            onClick={handleCancelEdit} 
                                            className="h-16 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={20} /> Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Category List */}
                    <div className="lg:col-span-8">
                        <div className="mb-10 relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search existing categories..."
                                className="w-full bg-[#1e293b] border border-slate-700 h-16 pl-16 pr-8 rounded-2xl text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700/50 shadow-2xl overflow-hidden">
                            {loading && !isEditing ? (
                                <div className="py-32 flex flex-col items-center justify-center gap-6">
                                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Categories...</p>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="py-32 text-center flex flex-col items-center gap-8">
                                    <Layers size={64} className="text-slate-800" />
                                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No categories found.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-700/50">
                                    {filteredCategories.map((category) => (
                                        <div key={category._id} className="p-10 hover:bg-[#243147] transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-lg group-hover:scale-110 transition-transform">
                                                        <Tag size={20} />
                                                    </div>
                                                    <h4 className="text-2xl font-bold text-white tracking-tight group-hover:text-primary transition-colors">
                                                        {category.name}
                                                    </h4>
                                                </div>
                                                <div className="ml-16">
                                                    <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium">
                                                        {category.description || 'No description provided.'}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                                        <Activity size={12} className="text-primary" /> ID: {category._id.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex sm:flex-col gap-3 ml-16 sm:ml-0">
                                                <button 
                                                    onClick={() => handleEdit(category)}
                                                    className="w-32 h-12 rounded-xl bg-[#0f172a] border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                                                >
                                                    <Edit size={16} /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(category._id)}
                                                    className="w-32 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                                                >
                                                    <Trash2 size={16} /> Delete
                                                </button>
                                            </div>
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

export default CategoryManagement;
