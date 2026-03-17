import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { GraduationCap, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                <GraduationCap size={28} color="#818cf8" />
                <span>EduCraft</span>
            </Link>

            <div className="navbar-links">
                <Link to="/courses" className="nav-link">Explore</Link>
                {user ? (
                    <>
                        <Link to="/dashboard" className="nav-link flex items-center gap-2">
                            <User size={18} /> Dashboard
                        </Link>
                        <button onClick={logout} className="btn btn-outline flex items-center gap-2">
                            <LogOut size={18} /> Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Log In</Link>
                        <Link to="/login?register=true" className="btn btn-primary">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
