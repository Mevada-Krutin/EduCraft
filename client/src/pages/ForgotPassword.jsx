import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/axiosConfig';
import { 
    Mail, Lock, ShieldCheck, 
    ArrowRight, ChevronLeft, GraduationCap,
    RefreshCw, KeyRound, Eye, EyeOff
} from 'lucide-react';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Reset
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/send-otp', { email });
            toast.success(data.message || 'Verification code sent!');
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send code');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.post('/api/auth/reset-password', { 
                email, 
                otp,
                newPassword 
            });
            toast.success(data.message || 'Password updated successfuly!');
            navigate('/login');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-[480px] relative z-10 fade-in">
                {/* Branding */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 border border-primary/20 shadow-glow">
                        <GraduationCap size={32} />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">
                        {step === 1 ? 'Reset Password' : 'Verify Code'}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {step === 1 
                            ? 'Enter your email to receive a 4-digit reset code' 
                            : `Enter the code sent to ${email}`}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl">
                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <input
                                        type="email"
                                        className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <>Send Verification Code <ArrowRight size={20} /></>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">4-Digit Code</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <input
                                        type="text"
                                        maxLength="4"
                                        className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all tracking-[0.5em] font-black text-xl"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-12 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300 ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                        <KeyRound size={20} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-12 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 text-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin" size={20} />
                                ) : (
                                    <>Update Password <ArrowRight size={20} /></>
                                )}
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-slate-500 hover:text-primary text-sm font-bold transition-colors"
                            >
                                Re-send Code
                            </button>
                        </form>
                    )}

                    <div className="mt-10 flex flex-col items-center text-center">
                        <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium">
                            <ChevronLeft size={16} /> Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
