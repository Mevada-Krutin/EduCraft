import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2 } from 'lucide-react';

const CreateCourse = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [category, setCategory] = useState('');
    const [videos, setVideos] = useState([{ title: '', url: '', duration: 0 }]);
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVideoChange = (index, field, value) => {
        const updatedVideos = [...videos];
        updatedVideos[index][field] = value;
        setVideos(updatedVideos);
    };

    const addVideo = () => {
        setVideos([...videos, { title: '', url: '', duration: 0 }]);
    };

    const removeVideo = (index) => {
        const updatedVideos = videos.filter((_, i) => i !== index);
        setVideos(updatedVideos);
    };

    const handleQuizChange = (index, field, value) => {
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[index][field] = value;
        setQuizzes(updatedQuizzes);
    };

    const handleOptionChange = (quizIndex, optionIndex, value) => {
        const updatedQuizzes = [...quizzes];
        updatedQuizzes[quizIndex].options[optionIndex] = value;
        setQuizzes(updatedQuizzes);
    };

    const addQuiz = () => {
        setQuizzes([...quizzes, { question: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
    };

    const removeQuiz = (index) => {
        const updatedQuizzes = quizzes.filter((_, i) => i !== index);
        setQuizzes(updatedQuizzes);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const courseData = { title, description, price, category, videos, quizzes };
            await axios.post('http://localhost:5000/api/courses', courseData, config);
            navigate('/instructor/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create course');
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create New Course</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Course Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows="4" style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label>Price ($)</label>
                        <input type="number" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                        <label>Category</label>
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }} />
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Course Videos</h3>
                        <button type="button" onClick={addVideo} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.5rem 1rem' }}>
                            <Plus size={16} /> Add Video
                        </button>
                    </div>

                    {videos.map((video, index) => (
                        <div key={index} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#f8fafc', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input type="text" placeholder="Video Title" value={video.title} onChange={(e) => handleVideoChange(index, 'title', e.target.value)} required style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%' }} />
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <input type="url" placeholder="Video URL (e.g. YouTube link)" value={video.url} onChange={(e) => handleVideoChange(index, 'url', e.target.value)} required style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', flex: 2 }} />
                                    <input type="number" placeholder="Duration (mins)" value={video.duration} onChange={(e) => handleVideoChange(index, 'duration', Number(e.target.value))} min="0" style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', flex: 1 }} />
                                </div>
                            </div>
                            {videos.length > 1 && (
                                <button type="button" onClick={() => removeVideo(index)} style={{ padding: '0.5rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={20} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>Final Exam (Optional)</h3>
                        <button type="button" onClick={addQuiz} className="btn btn-outline flex items-center gap-1" style={{ padding: '0.5rem 1rem' }}>
                            <Plus size={16} /> Add Question
                        </button>
                    </div>

                    {quizzes.length === 0 && <p style={{ color: '#64748b' }}>No quiz added. Add questions to require students to pass an exam for their certificate.</p>}

                    {quizzes.map((quiz, index) => (
                        <div key={index} style={{ padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4 style={{ margin: 0, fontWeight: 600 }}>Question {index + 1}</h4>
                                <button type="button" onClick={() => removeQuiz(index)} style={{ padding: '0.25rem', color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <input type="text" placeholder="Enter question text here..." value={quiz.question} onChange={(e) => handleQuizChange(index, 'question', e.target.value)} required style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%', fontSize: '1rem' }} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {quiz.options.map((option, optIdx) => (
                                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input type="radio" name={`correctOption_${index}`} checked={quiz.correctOptionIndex === optIdx} onChange={() => handleQuizChange(index, 'correctOptionIndex', optIdx)} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }} title="Mark as correct answer" />
                                        <input type="text" placeholder={`Option ${optIdx + 1}`} value={option} onChange={(e) => handleOptionChange(index, optIdx, e.target.value)} required style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', flex: 1 }} />
                                    </div>
                                ))}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Select the radio button next to the correct option.</p>
                        </div>
                    ))}
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}>
                    {loading ? 'Creating...' : 'Create Course'}
                </button>
            </form>
        </div>
    );
};

export default CreateCourse;
