import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const ResetPassword = () => {
    const { resettoken } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        setError('');
        
        try {
            await axios.put(`http://localhost:5000/api/auth/resetpassword/${resettoken}`, { password });
            setSuccess(true);
            setMessage('Password reset successfully!');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired token. Please try requesting a new reset link.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex justify-center items-center" style={{ minHeight: '70vh' }}>
                <div className="card text-center p-8 max-w-md w-full animate-fade-in">
                    <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Success!</h2>
                    <p className="text-secondary mb-6">{message}</p>
                    <p className="text-sm text-slate-400">Redirecting you to the login page...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="card w-full animate-fade-in" style={{ maxWidth: '450px', padding: '2rem' }}>
                <h2 className="text-center mb-2 text-2xl font-bold">Reset Password</h2>
                <p className="text-secondary text-center mb-6">Create a strong new password for your account.</p>

                {error && <div className="text-red-500 bg-red-500/10 p-3 rounded mb-4 border border-red-500/20 text-sm">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            className="input w-full"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary w-full py-2 flex justify-center items-center"
                        disabled={loading}
                        style={{ height: '42px' }}
                    >
                        {loading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                    <div className="mt-4 text-center">
                        <Link to="/login" className="text-secondary hover:text-white text-sm transition-colors">Return to Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
