import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import CourseQuiz from '../components/CourseQuiz';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const Quiz = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/api/courses/${courseId}`);
                setCourse(data);
                
                // Verify user is enrolled and progress is 100%
                const enrollmentsRes = await api.get('/api/users/enrollments');
                const enrolled = enrollmentsRes.data.find(e => e.course?._id === courseId);
                
                if (!enrolled) {
                    toast.error('You are not enrolled in this course.');
                    navigate('/dashboard');
                } else if (enrolled.progress < 100) {
                    toast.error('You must complete all lessons before taking the quiz.');
                    navigate(`/course/${courseId}`);
                }

            } catch (err) {
                toast.error('Error fetching quiz details');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId, navigate]);

    if (loading) return <div className="text-center py-20 text-slate-400">Loading exam...</div>;
    if (!course) return null;

    if (!course.quizzes || course.quizzes.length === 0) {
        return (
            <div className="animate-fade-in text-center py-20 max-w-lg mx-auto">
                <div className="card p-8">
                    <h2 className="text-xl font-bold mb-4">No Exam Required</h2>
                    <p className="text-slate-400 mb-6">This course does not have a final exam.</p>
                    <button onClick={() => navigate(`/course/${courseId}`)} className="btn btn-primary">
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
            <button 
                onClick={() => navigate(`/course/${courseId}`)} 
                className="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={20} /> Back to Course
            </button>
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Final Exam: {course.title}</h1>
                <p className="text-slate-400">Pass this exam with a score of 80% or higher to earn your certificate.</p>
            </div>

            <CourseQuiz 
                courseId={courseId} 
                quizzes={course.quizzes} 
                token={user?.token} 
                onPass={() => {
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 5000);
                }}
            />
        </div>
    );
};

export default Quiz;
