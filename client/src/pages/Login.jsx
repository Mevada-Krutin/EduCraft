import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register, user } = useContext(AuthContext);
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
        setError('');
        setLoading(true);

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(name, email, password, 'student');
        }

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="auth-container animate-fade-in">
            <div className="auth-header">
                <h2>{isLogin ? 'Welcome Back' : 'Join EduCraft'}</h2>
                <p className="text-secondary">
                    {isLogin
                        ? 'Sign in to access your purchased courses'
                        : 'Create an account to jumpstart your learning'}
                </p>
            </div>

            {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', border: '1px solid #ef4444' }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-control"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <div className="flex justify-between">
                        <label htmlFor="password">Password</label>
                        {isLogin && <Link to="/forgotpassword" style={{ fontSize: '0.85rem', color: '#818cf8', textDecoration: 'none' }}>Forgot password?</Link>}
                    </div>
                    <input
                        type="password"
                        id="password"
                        className="form-control"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
            </form>

            <div className="text-center mt-4">
                <p className="text-secondary">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign up' : 'Log in'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
