import { useState } from 'react';
import axios from 'axios';
import { 
  CheckCircle2, XCircle, 
  HelpCircle, ChevronRight, 
  Target, Award, ShieldCheck,
  Zap, BrainCircuit, Timer,
  RotateCcw
} from 'lucide-react';

const CourseQuiz = ({ courseId, quizzes, token, onPass }) => {
    const [answers, setAnswers] = useState(new Array(quizzes.length).fill(null));
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleSelect = (qIndex, optionIndex) => {
        const newAnswers = [...answers];
        newAnswers[qIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        if (answers.includes(null)) {
            alert('Strategic Integrity Compromised: Please complete all validation nodes.');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            // Calculate score on frontend for immediate feedback, then send to backend for permanent record
            let correctCount = 0;
            quizzes.forEach((q, idx) => {
                if (answers[idx] === q.correctOptionIndex) correctCount++;
            });
            const score = (correctCount / quizzes.length) * 100;

            const { data } = await axios.post(`http://localhost:5000/api/courses/${courseId}/quizzes/submit`, { 
                score, 
                totalPoints: 100 
            }, config);
            
            setResult({
                success: score >= 80, // Mastery threshold
                score: score,
                message: score >= 80 ? 'Strategic Mastery Validated. Nodes fully synchronized.' : 'Verification Failed. Re-synchronization required.'
            });

            if (score >= 80 && onPass) {
                onPass();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Synaptic Transmission Error: Submission Failed');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="glass-morphism p-16 text-center rounded-[3rem] border border-white/10 animate-in fade-in zoom-in duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-30"></div>
                
                <div className="relative mb-10">
                    <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center border-4 shadow-2xl ${
                        result.success ? 'border-success text-success bg-success/10 shadow-success/20' : 'border-danger text-danger bg-danger/10 shadow-danger/20'
                    }`}>
                        {result.success ? <ShieldCheck size={64} /> : <XCircle size={64} />}
                    </div>
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black border border-white/10 rounded-xl">
                        <span className="text-2xl font-black text-white tracking-tighter">{Math.round(result.score)}%</span>
                    </div>
                </div>

                <div className="max-w-md mx-auto">
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
                        {result.success ? 'VALIDATION SUCCESS' : 'SYMMETRY BREACH'}
                    </h2>
                    <p className="text-text-secondary text-lg italic leading-relaxed mb-10">
                        {result.message}
                    </p>
                    
                    {!result.success && (
                        <button 
                            onClick={() => { setResult(null); setAnswers(new Array(quizzes.length).fill(null)); }} 
                            className="btn btn-outline h-14 px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5 transition-all flex items-center gap-3 mx-auto"
                        >
                            <RotateCcw size={16} /> Re-Initialize Assessment
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-morphism p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <BrainCircuit size={200} />
            </div>

            <header className="mb-12 pb-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
                            <Target size={18} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Tactical Validation Sequence</span>
                    </div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Symmetry Verification</h2>
                </div>
                <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Mastery threshold</span>
                        <span className="text-lg font-black text-warning tracking-tighter">80.00%</span>
                    </div>
                    <div className="w-10 h-10 bg-warning/20 rounded-xl flex items-center justify-center text-warning border border-warning/10">
                        <Zap size={20} />
                    </div>
                </div>
            </header>
            
            <div className="space-y-12 mb-16">
                {quizzes.map((quiz, qIndex) => (
                    <div key={qIndex} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-start gap-5 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center text-xs font-black shadow-lg shadow-primary/30 flex-shrink-0">
                                {qIndex + 1}
                            </div>
                            <h4 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{quiz.question}</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {quiz.options.map((option, oIndex) => (
                                <button 
                                    key={oIndex} 
                                    onClick={() => handleSelect(qIndex, oIndex)}
                                    className={`relative flex items-center gap-4 p-5 rounded-2xl text-left transition-all border group ${
                                        answers[qIndex] === oIndex 
                                        ? 'bg-primary/20 border-primary text-white shadow-lg shadow-primary/10' 
                                        : 'bg-white/5 border-transparent text-text-secondary hover:border-white/10 hover:text-white'
                                    }`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        answers[qIndex] === oIndex ? 'bg-primary border-primary scale-110 shadow-lg shadow-primary/40' : 'border-white/10'
                                    }`}>
                                        {answers[qIndex] === oIndex && <CheckCircle2 size={14} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-bold tracking-tight">{option}</span>
                                    {answers[qIndex] === oIndex && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                                            <ShieldCheck size={24} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="btn btn-primary h-20 w-full rounded-[2rem] text-sm font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 overflow-hidden relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-400 to-primary translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                            Synchronizing Validation Data...
                        </>
                    ) : (
                        <>
                            Submit Strategic Profile <ChevronRight size={18} />
                        </>
                    )}
                </span>
            </button>
        </div>
    );
};

export default CourseQuiz;
