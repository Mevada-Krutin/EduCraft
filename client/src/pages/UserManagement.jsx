import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  Users, Mail, Shield, 
  Search, Filter, ChevronLeft, ChevronRight,
  ArrowLeft, MoreVertical,
  ShieldCheck, Zap, ShieldAlert, Activity,
  UserCheck, UserX, Trash2
} from 'lucide-react';

const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/api/users?page=${page}&limit=10`);
            setUsers(data.users);
            setTotalPages(data.pages);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await api.put(`/api/users/${userId}/role`, { role: newRole });
            toast.success(`User updated to ${newRole.toUpperCase()}`);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user role');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const action = currentStatus ? 'Deactivate' : 'Reactivate';
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            try {
                await api.put(`/api/users/${userId}/status`);
                toast.success(`User ${currentStatus ? 'deactivated' : 'reactivated'} successfully`);
                fetchUsers();
            } catch (err) {
                toast.error('Failed to update user status');
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header */}
                <header className="mb-12">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                                    System Administration
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight uppercase">User Management</h1>
                            <p className="text-slate-400 text-lg mt-2">View and manage all registered users on the platform.</p>
                        </div>
                    </div>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col lg:flex-row gap-6 mb-12">
                    <div className="relative flex-1">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search users by name or email..."
                            className="w-full bg-[#1e293b] border border-slate-700 h-16 pl-16 pr-8 rounded-2xl text-white font-bold placeholder:text-slate-600 focus:border-primary outline-none transition-all shadow-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-[#1e293b] border border-slate-700 text-white h-16 px-8 rounded-2xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-3 shadow-xl">
                            <Filter size={20} className="text-primary" /> Filter
                        </button>
                        <button className="bg-primary text-white h-16 px-8 rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all flex items-center gap-3">
                            <Zap size={20} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-[#1e293b] rounded-[3rem] border border-slate-700/50 shadow-2xl overflow-hidden mb-12">
                    {loading ? (
                        <div className="py-32 flex flex-col items-center justify-center gap-6">
                            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading Users...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0f172a] border-b border-slate-700">
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">User Identity</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Account Type</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                                        <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="px-10 py-32 text-center">
                                                <div className="flex flex-col items-center gap-6 text-slate-700">
                                                    <ShieldAlert size={64} />
                                                    <p className="text-xs font-bold uppercase tracking-widest">No users found matching your search.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-[#243147] transition-all group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xl shadow-lg">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-lg group-hover:text-primary transition-colors">{user.name}</div>
                                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                                                <Mail size={12} /> {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className="relative w-44">
                                                        <select 
                                                            value={user.role} 
                                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                            className="w-full bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-white outline-none focus:border-primary transition-all appearance-none cursor-pointer shadow-inner"
                                                        >
                                                            <option value="student">Student</option>
                                                            <option value="instructor">Instructor</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                                            <ChevronRight size={14} className="rotate-90" />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    {user.isActive ? (
                                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                            Suspended
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <button 
                                                            onClick={() => handleStatusToggle(user._id, user.isActive)}
                                                            className={`h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                                user.isActive 
                                                                ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white' 
                                                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                            }`}
                                                        >
                                                            {user.isActive ? 'Suspend' : 'Reactivate'}
                                                        </button>
                                                        <button className="w-11 h-11 flex items-center justify-center bg-[#0f172a] text-slate-500 hover:text-white rounded-xl border border-slate-700 transition-all">
                                                            <MoreVertical size={20} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4">
                        <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                            Page <span className="text-white">{page}</span> of <span className="text-white">{totalPages}</span>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))} 
                                disabled={page === 1}
                                className="w-14 h-14 bg-[#1e293b] border border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-20 hover:bg-slate-700 transition-all shadow-xl"
                            >
                                <ChevronLeft size={24} className="text-white" />
                            </button>
                            <button 
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                                disabled={page === totalPages}
                                className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center disabled:opacity-20 hover:bg-primary-hover transition-all shadow-xl shadow-primary/20"
                            >
                                <ChevronRight size={24} className="text-white" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
