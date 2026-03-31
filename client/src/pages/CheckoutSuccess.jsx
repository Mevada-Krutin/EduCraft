import { useEffect, useState, useContext, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Loader } from 'lucide-react';
import Confetti from 'react-confetti';

const CheckoutSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('course_id');
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');
    const hasAttempted = useRef(false);

    useEffect(() => {
        const verifyPaymentAndEnroll = async () => {
            if (!user || !sessionId || !courseId || hasAttempted.current) return;
            hasAttempted.current = true;
            
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Securely finalize enrollment with backend verifying the Stripe session
                await axios.post('http://localhost:5000/api/users/enroll', { courseId, sessionId }, config);
                setStatus('success');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 5000);
            } catch (err) {
                // If Already enrolled, it's technically a success state (page refresh)
                if (err.response?.status === 400 && err.response?.data?.message === 'Already enrolled in this course') {
                    setStatus('success');
                    setTimeout(() => navigate('/dashboard'), 3000);
                } else {
                    setStatus('error');
                    setError(err.response?.data?.message || 'Verification failed');
                }
            }
        };

        verifyPaymentAndEnroll();
    }, [sessionId, courseId, user, navigate]);

    if (!user) {
        return <div className="text-center py-5 mt-5">Please log in to complete your transaction.</div>;
    }

    return (
        <div className="flex justify-center items-center mt-10">
            <div className="card text-center p-5 max-w-lg w-full animate-fade-in">
                {status === 'processing' && (
                    <>
                        <Loader className="animate-spin mx-auto mb-4 text-primary" size={64} style={{ animationDuration: '3s' }} color="#6366f1" />
                        <h2 className="mb-2">Verifying Payment...</h2>
                        <p className="text-secondary">Please don't close this window: securely verifying your transaction with Stripe.</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9999 }}>
                            <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} colors={['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6']} />
                        </div>
                        <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                        <h2 className="mb-2">Payment Successful!</h2>
                        <p className="text-secondary mb-4">Welcome to the class! You are officially enrolled.</p>
                        <p className="text-sm font-semibold text-primary">Redirecting you to your dashboard space...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="text-red-500 text-6xl mb-4">❌</div>
                        <h2 className="mb-2">Payment Error</h2>
                        <p className="text-secondary mb-4">{error}</p>
                        <button onClick={() => navigate(`/course/${courseId}`)} className="btn btn-primary w-full py-2">Return to Course Overview</button>
                    </>
                )}
            </div>
        </div>
    );
};

export default CheckoutSuccess;
