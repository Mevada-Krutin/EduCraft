import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [resetLink, setResetLink] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        setResetLink('');

        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/forgotpassword', { email });
            setMessage(data.message);
            // In a real production app, the server would EMAIL this link.
            // For this project scale, we instantly show the link for easy testing!
            if (data.resetUrl) {
                setResetLink(data.resetUrl);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center" style={{ minHeight: '80vh', padding: '2rem 1rem' }}>
            <div className="card w-full animate-fade-in" style={{ maxWidth: '450px', padding: '2rem' }}>
                <h2 className="text-center mb-4 text-2xl font-bold">Forgot Password</h2>
                <p className="text-secondary text-center mb-6">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>

                {error && <div className="text-red-500 bg-red-500/10 p-3 rounded mb-4 border border-red-500/20">{error}</div>}
                
                {message && (
                    <div className="text-emerald-500 bg-emerald-500/10 p-4 rounded mb-6 border border-emerald-500/20 text-center">
                        <p className="mb-2 font-semibold">{message}</p>
                        {resetLink && (
                            <a 
                                href={resetLink} 
                                className="block mt-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-colors text-sm break-all font-mono"
                            >
                                {resetLink}
                            </a>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="input w-full"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary w-full py-2 flex justify-center items-center" 
                        disabled={loading}
                        style={{ height: '42px' }}
                    >
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-secondary">Remember your password? </span>
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
