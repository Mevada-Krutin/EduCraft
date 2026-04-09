import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Plus, HelpCircle, CheckCircle2, 
  Trash2, ArrowLeft, List,
  CheckCircle, AlertCircle, RefreshCw,
  Layout, BookOpen, Settings,
  MessageSquare, Sliders
} from 'lucide-react';

const QuizBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
    
    const [courseTitle, setCourseTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);

    const fetchCourse = async () => {
        try {
            const { data } = await api.get(`/api/courses/${id}`);
            setCourseTitle(data.title);
            setQuizzes(data.quizzes || []);
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

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddQuiz = async (e) => {
        e.preventDefault();
        
        if (options.some(opt => !opt.trim())) {
            toast.error('Data Integrity Violation: All 4 options must be populated.');
            return;
        }

        setLoading(true);

        try {
            await api.post(`/api/courses/${id}/quizzes`, { question, options, correctOptionIndex });
            toast.success('Pedagogical assessment entry integrated.');
            
            // Reset form
            setQuestion('');
            setOptions(['', '', '', '']);
            setCorrectOptionIndex(0);
            
            fetchCourse();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Integration Failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (quizId) => {
        if (window.confirm('Are you sure you want to remove this assessment entry?')) {
            try {
                await api.delete(`/api/courses/${id}/quizzes/${quizId}`);
                toast.success('Assessment entry purged.');
                fetchCourse();
            } catch (err) {
                toast.error('Purge operation failed.');
            }
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-center">
                    <p className="font-black uppercase tracking-[0.2em] text-sm text-primary mb-2">Syncing Assessment Data</p>
                    <p className="text-text-muted italic">Identifying pedagogical validation structures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 fade-up">
            {/* Header */}
            <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <button 
                        onClick={() => navigate('/instructor/dashboard')}
                        className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Control Center
                    </button>
                    <h1 className="text-4xl md:text-5xl mb-2 flex items-center gap-4">
                        Assessment Architect
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Constructing validation logic for: <span className="text-white font-bold">{courseTitle}</span>
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Quiz Form Section */}
                <div className="lg:col-span-12">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* New Question Form */}
                        <div className="lg:col-span-5 order-2 lg:order-1 sticky top-6">
                            <div className="card border-primary/20 bg-primary/5 p-8">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="p-3 bg-primary/20 text-primary rounded-2xl">
                                        <Plus size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-white px-2">Inject Assessment</h3>
                                </div>
                                
                                <form onSubmit={handleAddQuiz} className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-1.5">
                                            <HelpCircle size={10} className="text-primary" /> Validation Query
                                        </label>
                                        <textarea 
                                            placeholder="e.g. Determine the primary output of a NAND gate when both inputs are high."
                                            className="input bg-bg-main/50 border-border focus:ring-2 focus:ring-primary/20 py-4 min-h-[100px]" 
                                            value={question} 
                                            onChange={(e) => setQuestion(e.target.value)} 
                                            required 
                                            rows="3"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-muted ml-1 flex items-center gap-1.5">
                                            <Sliders size={10} className="text-primary" /> Potential Vectors
                                        </label>
                                        
                                        <div className="grid grid-cols-1 gap-4">
                                            {options.map((option, idx) => (
                                                <div key={idx} className={`relative flex items-center gap-3 p-1 rounded-2xl border transition-all ${correctOptionIndex === idx ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-bg-main/50 border-border'}`}>
                                                    <div className="flex items-center justify-center pl-3">
                                                        <input 
                                                            type="radio" 
                                                            name="correctOption" 
                                                            checked={correctOptionIndex === idx} 
                                                            onChange={() => setCorrectOptionIndex(idx)} 
                                                            className="w-5 h-5 cursor-pointer accent-primary"
                                                        />
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        className="input bg-transparent border-none focus:ring-0 h-12 text-sm font-medium" 
                                                        value={option} 
                                                        onChange={(e) => handleOptionChange(idx, e.target.value)} 
                                                        required 
                                                        placeholder={`Vector Alpha-${idx + 1}...`}
                                                    />
                                                    {correctOptionIndex === idx && (
                                                        <div className="absolute right-4 text-primary animate-in fade-in zoom-in duration-300">
                                                            <CheckCircle2 size={16} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-bg-main/50 rounded-2xl border border-dashed border-border group hover:border-primary/30 transition-all">
                                        <p className="text-[10px] text-text-muted italic flex items-start gap-2">
                                            <AlertCircle size={12} className="shrink-0 mt-0.5 text-primary" /> 
                                            Ensure the "Correct Version" radio is toggled for the accurate vector before integration.
                                        </p>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="btn btn-primary h-16 w-full rounded-2xl shadow-xl shadow-primary/20 flex justify-center items-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    >
                                        {loading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Plus size={18} /> Integrate Logic
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Questions List Pane */}
                        <div className="lg:col-span-7 order-1 lg:order-2">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <List className="text-primary" /> Active Logic Matrix
                                </h3>
                                <span className="badge bg-surface border border-border px-4 py-1.5 text-[10px] font-black text-white uppercase tracking-widest">
                                    {quizzes.length} Entries
                                </span>
                            </div>
                            
                            {quizzes.length === 0 ? (
                                <div className="card border-dashed border-border flex flex-col items-center justify-center py-24 text-center gap-6 bg-surface/20">
                                    <div className="p-6 bg-primary/5 text-primary/20 rounded-full">
                                        <MessageSquare size={64} />
                                    </div>
                                    <p className="text-text-muted italic max-w-xs leading-relaxed">Matrix sequence is empty. Assessment data required for certification eligibility.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {quizzes.map((quiz, idx) => (
                                        <div key={quiz._id || idx} className="card group hover:border-primary/50 p-8 bg-surface/30 backdrop-blur-sm transition-all relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                            
                                            <div className="flex justify-between items-start gap-4 mb-6">
                                                <div className="flex gap-4">
                                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-bg-main border border-border flex items-center justify-center text-primary font-black shadow-inner">
                                                        {idx + 1}
                                                    </div>
                                                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors leading-relaxed">{quiz.question}</h4>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                                    className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                                                    title="Purge Logic"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-14">
                                                {quiz.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider ${quiz.correctOptionIndex === oIdx ? 'bg-primary/10 border-primary/30 text-primary shadow-sm shadow-primary/5' : 'bg-bg-main/30 border-border text-text-muted'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${quiz.correctOptionIndex === oIdx ? 'bg-primary animate-pulse' : 'bg-text-muted/30'}`}></div>
                                                        <span className="truncate">{opt}</span>
                                                        {quiz.correctOptionIndex === oIdx && <CheckCircle size={12} className="ml-auto" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="flex items-center gap-3 p-6 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                                        <div className="p-2 bg-primary/20 text-primary rounded-lg shrink-0">
                                            <CheckCircle size={16} />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Logic integrity verified. Matrix fulfills certification parameters.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuizBuilder;
