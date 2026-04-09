import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { 
  User, Mail,
  ShieldCheck,
  Save, ChevronLeft,
  Image, Phone
} from 'lucide-react';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setPhone(user.phone || '');
            setProfilePicture(user.profilePicture || '');
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateData = { name, phone, profilePicture };
            const { data } = await api.put('/api/users/profile', updateData);
            
            const updatedUser = { ...data, token: data.token || user.token };
            
            setUser(updatedUser);
            sessionStorage.setItem('userInfo', JSON.stringify(updatedUser));
            if (data.token) {
                sessionStorage.setItem('token', data.token);
            }

            toast.success('Profile updated successfully!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in pt-8 md:pt-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <button 
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">Profile Settings</h1>
                        <p className="text-slate-400 text-lg">Manage your account information.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Avatar Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-700/50 text-center shadow-xl">
                            <div className="relative inline-block mb-6">
                                <div className="w-40 h-40 rounded-[2rem] bg-[#0f172a] flex items-center justify-center text-5xl font-bold text-primary overflow-hidden border-4 border-slate-700 shadow-inner">
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2.5 rounded-xl shadow-lg border-4 border-[#1e293b]">
                                    <ShieldCheck size={20} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-1">{name}</h3>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{user?.role} Account</p>
                        </div>
                    </div>

                    {/* Main Settings Form */}
                    <div className="lg:col-span-8">
                        <form onSubmit={handleSubmit} className="bg-[#1e293b] p-10 rounded-[2.5rem] border border-slate-700/50 shadow-xl space-y-10">
                            
                            {/* Personal Info */}
                            <div className="space-y-8">
                                <h2 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                                    <User size={20} className="text-primary" /> Personal Info
                                </h2>
                                
                                <div className="grid grid-cols-1 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-white ml-1">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                                <User size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#0f172a] border border-slate-700 h-16 pl-14 pr-6 rounded-2xl text-lg font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-white ml-1">Profile Picture URL</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                                <Image size={20} />
                                            </div>
                                            <input
                                                type="url"
                                                className="w-full bg-[#0f172a] border border-slate-700 h-16 pl-14 pr-6 rounded-2xl text-lg font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                                                value={profilePicture}
                                                onChange={(e) => setProfilePicture(e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-white ml-1">Mobile Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors">
                                                <Phone size={20} />
                                            </div>
                                            <input
                                                type="tel"
                                                className="w-full bg-[#0f172a] border border-slate-700 h-16 pl-14 pr-6 rounded-2xl text-lg font-bold text-white placeholder:text-slate-600 focus:border-primary outline-none transition-all"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-white ml-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600">
                                                <Mail size={20} />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full bg-[#0f172a]/50 border border-slate-800 h-16 pl-14 pr-6 rounded-2xl text-lg font-bold text-slate-500 outline-none cursor-not-allowed"
                                                value={user?.email || ''}
                                                disabled
                                            />
                                        </div>
                                        <p className="text-xs text-slate-600 ml-1">Email cannot be changed.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-10 flex flex-col sm:flex-row gap-6">
                                <button 
                                    type="submit" 
                                    className="flex-1 btn-primary h-18 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 active:scale-[0.98]" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={24} /> Save Changes
                                        </>
                                    )}
                                </button>
                                <button 
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="h-18 px-10 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
