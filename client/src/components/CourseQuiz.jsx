import { useState } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle } from 'lucide-react';

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
            alert('Please answer all questions before submitting.');
            return;
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post(`http://localhost:5000/api/users/enrollments/${courseId}/quiz`, { answers }, config);
            
            setResult({
                success: data.success,
                score: data.score,
                message: data.message
            });

            if (data.success && onPass) {
                onPass();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting quiz');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="card text-center py-5">
                {result.success ? (
                    <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                ) : (
                    <XCircle size={64} className="text-red-500 mx-auto mb-4" />
                )}
                <h2 className="mb-2">{result.success ? 'Passed!' : 'Not quite there...'}</h2>
                <p className="text-xl mb-4">You scored {Math.round(result.score)}%</p>
                <p className="text-secondary mb-4">{result.message}</p>
                
                {!result.success && (
                    <button onClick={() => { setResult(null); setAnswers(new Array(quizzes.length).fill(null)); }} className="btn btn-outline mt-4">
                        Retake Quiz
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="card p-5 animate-fade-in">
            <h2 className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>Final Assessment</h2>
            <p className="text-secondary mb-5">You must score at least 80% to earn your certificate.</p>
            
            {quizzes.map((quiz, qIndex) => (
                <div key={qIndex} className="mb-6 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 className="mb-4" style={{ fontSize: '1.1rem' }}>{qIndex + 1}. {quiz.question}</h4>
                    <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        {quiz.options.map((option, oIndex) => (
                            <div 
                                key={oIndex} 
                                onClick={() => handleSelect(qIndex, oIndex)}
                                style={{ 
                                    padding: '1rem', 
                                    borderRadius: '0.5rem', 
                                    border: answers[qIndex] === oIndex ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    backgroundColor: answers[qIndex] === oIndex ? 'rgba(99,102,241,0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ 
                                    width: '20px', 
                                    height: '20px', 
                                    borderRadius: '50%', 
                                    border: answers[qIndex] === oIndex ? '6px solid var(--primary-color)' : '2px solid var(--border-color)',
                                }}></div>
                                <span>{option}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary mt-4 w-full py-3" style={{ fontSize: '1.1rem' }}>
                {loading ? 'Submitting...' : 'Submit Answers'}
            </button>
        </div>
    );
};

export default CourseQuiz;
