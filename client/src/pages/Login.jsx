import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { 
    Mail, Lock, User, 
    ArrowRight, ChevronLeft, GraduationCap,
    Eye, EyeOff, ShieldCheck
} from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [otp, setOtp] = useState('');

    const { login, register, sendSignupOTP, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
        const params = new URLSearchParams(location.search);
        if (params.get('register') === 'true') {
            setIsLogin(false);
        }
    }, [user, navigate, location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isLogin && step === 1) {
            const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
            const domain = email.split('@')[1];
            const isInstitutional = domain.endsWith('.edu') || domain.endsWith('.ac.in');
            
            if (!allowedDomains.includes(domain) && !isInstitutional) {
                toast.error('Please use Gmail, Yahoo, Outlook, Hotmail, or an institutional (.edu / .ac.in) email');
                return;
            }
        }

        setLoading(true);

        try {
            let result;
            if (isLogin) {
                result = await login(email, password);
            } else if (step === 1) {
                result = await sendSignupOTP(name, email, password, 'student');
                if (result.success) {
                    toast.success(result.message);
                    setStep(2);
                    setLoading(false);
                    return;
                }
            } else {
                result = await register(email, otp);
            }

            if (result.success) {
                toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
                navigate('/dashboard');
            } else {
                toast.error(result.error);
            }
        } catch (err) {
            toast.error('Authentication Error');
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
                   <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
                       {isLogin ? 'Welcome Back' : 'Join EduCraft'}
                   </h1>
                   <p className="text-slate-400 text-lg">
                       {isLogin ? 'Sign in to your account to continue' : 'Create an account to jumpstart your learning'}
                   </p>
                </div>

                {/* Auth Card */}
                <div className="bg-[#1e293b] border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && step === 2 ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="text-sm font-semibold text-slate-300 ml-1">6-Digit Verification Code</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <input
                                            id="otp"
                                            name="otp"
                                            type="text"
                                            maxLength="6"
                                            className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all tracking-[0.3em] font-black text-xl"
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 ml-1">
                                        Enter the code sent to <span className="text-primary font-medium">{email}</span>
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-primary text-xs font-bold hover:underline ml-1"
                                >
                                    Change details?
                                </button>
                            </div>
                        ) : (
                            <>
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label htmlFor="full-name" className="text-sm font-semibold text-slate-300 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                                <User size={20} />
                                            </div>
                                            <input
                                                id="full-name"
                                                name="name"
                                                type="text"
                                                autoComplete="name"
                                                className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                                placeholder="John Doe"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="username email"
                                            className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-4 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label htmlFor="password" name="password" className="text-sm font-semibold text-slate-300">Password</label>
                                        <Link to="/forgot-password" size={12} className="text-primary text-xs font-bold hover:underline">Forgot Password?</Link>
                                    </div>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete={isLogin ? "current-password" : "new-password"}
                                            className="w-full bg-[#0f172a] border border-slate-700 h-14 pl-12 pr-12 rounded-xl text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
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
                            </>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-hover text-white font-bold h-14 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2 text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : (step === 1 ? 'Send Verification Code' : 'Verify & Create Account')}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 flex flex-col items-center text-center">
                        <p className="text-slate-400 mb-2">
                            {isLogin ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-primary font-bold hover:underline ml-1.5"
                            >
                                {isLogin ? 'Sign Up' : 'Log in'}
                            </button>
                        </p>
                        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm font-medium mt-4">
                            <ChevronLeft size={16} /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
