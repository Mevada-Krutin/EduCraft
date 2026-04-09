import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, BookOpen, 
  DollarSign, ArrowLeft, Download,
  Filter, Calendar, RefreshCw,
  Activity, Globe, Zap, Database,
  ArrowUpRight, ChevronRight, ShieldCheck,
  Layers, Target, Cpu
} from 'lucide-react';

const Reports = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        categories: [],
        enrollmentTrends: [],
        topMentors: []
    });

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data: reportData } = await api.get('/api/admin/reports');
            
            const formattedTrends = reportData.enrollmentTrends.map(item => ({
                name: `${new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' })}`,
                enrollments: item.count
            }));

            setData({
                categories: reportData.categories,
                enrollmentTrends: formattedTrends,
                topMentors: reportData.topMentors
            });
        } catch (err) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in px-4">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <header className="mb-16">
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} /> Back to Dashboard
                    </button>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20">
                                    Data Insights
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-extrabold text-white tracking-tight uppercase">Platform Analytics</h1>
                            <p className="text-slate-400 text-xl mt-4 font-medium leading-relaxed">A comprehensive overview of platform growth, course distribution, and instructor performance.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={fetchReports} className="bg-[#1e293b] border border-slate-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center hover:bg-slate-700 transition-all shadow-xl">
                                <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <button className="bg-primary text-white h-16 px-10 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-[0.98]">
                                <Download size={20} /> Export Report
                            </button>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-6">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Generating Insights...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        
                        {/* Enrollment Growth Chart */}
                        <div className="lg:col-span-8 bg-[#1e293b] border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                                        <TrendingUp className="text-primary" size={28} /> Enrollment Growth
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">New student enrollments over the past few months</p>
                                </div>
                                <div className="flex bg-[#0f172a] p-1.5 rounded-2xl border border-slate-700 shadow-inner">
                                    <button className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl bg-primary text-white shadow-lg">Monthly</button>
                                    <button className="px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest rounded-xl text-slate-500 hover:text-white transition-colors">Weekly</button>
                                </div>
                            </div>
                            <div className="h-[400px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.enrollmentTrends}>
                                        <defs>
                                            <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="rgba(255,255,255,0.4)" 
                                            fontSize={12} 
                                            fontWeight={700}
                                            tickLine={false} 
                                            axisLine={false} 
                                            dy={15}
                                        />
                                        <YAxis 
                                            stroke="rgba(255,255,255,0.4)" 
                                            fontSize={12} 
                                            fontWeight={700}
                                            tickLine={false} 
                                            axisLine={false} 
                                            dx={-15}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1.5rem', padding: '1.25rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 800, textTransform: 'uppercase', fontSize: '12px' }}
                                            cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="enrollments" 
                                            stroke="#6366f1" 
                                            strokeWidth={4} 
                                            fillOpacity={1}
                                            fill="url(#colorEnroll)"
                                            dot={{ r: 6, fill: '#0f172a', strokeWidth: 3, stroke: '#6366f1' }}
                                            activeDot={{ r: 10, strokeWidth: 0, fill: '#6366f1' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="lg:col-span-4 bg-[#1e293b] border border-slate-700/50 p-10 rounded-[2.5rem] shadow-2xl flex flex-col">
                            <div className="mb-10">
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                                    <Layers className="text-primary" size={28} /> Category Distribution
                                </h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Percentage of courses per category</p>
                            </div>
                            <div className="flex-1 min-h-[300px] w-full relative">
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total</div>
                                        <div className="text-4xl font-extrabold text-white tracking-tight">100%</div>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={85}
                                            outerRadius={120}
                                            paddingAngle={8}
                                            dataKey="count"
                                            nameKey="_id"
                                            stroke="none"
                                        >
                                            {data.categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1rem', padding: '1rem' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-10 grid grid-cols-2 gap-4">
                                {data.categories.map((cat, idx) => (
                                    <div key={cat._id} className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">{cat._id}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white ml-4">{cat.count} Courses</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Instructors */}
                        <div className="lg:col-span-12 bg-[#1e293b] border border-slate-700/50 rounded-[2.5rem] shadow-2xl overflow-hidden mt-6">
                            <div className="p-10 border-b border-slate-700/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-white uppercase tracking-tight flex items-center gap-4">
                                        <ShieldCheck className="text-emerald-500" size={28} /> Top Performing Instructors
                                    </h3>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Instructors with the highest engagement and course count</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#0f172a] border-b border-slate-700">
                                            <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500">Instructor</th>
                                            <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Courses Published</th>
                                            <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Total Students</th>
                                            <th className="px-10 py-8 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Avg Support</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {data.topMentors.map((mentor, idx) => (
                                            <tr key={idx} className="hover:bg-[#243147] transition-all group">
                                                <td className="px-10 py-10">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-2xl shadow-lg">
                                                            {mentor.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xl text-white group-hover:text-primary transition-colors">{mentor.name}</div>
                                                            <div className="text-xs font-bold text-slate-500 mt-1">{mentor.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-10 text-center">
                                                    <div className="px-5 py-2.5 rounded-xl bg-[#0f172a] border border-slate-700 w-fit mx-auto shadow-inner">
                                                        <span className="text-sm font-bold text-white uppercase tracking-widest">{mentor.courseCount} Courses</span>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-10 text-center">
                                                    <div className="text-4xl font-extrabold text-white tracking-tight">{mentor.totalStudents?.toLocaleString() || 0}</div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Total Learners</div>
                                                </td>
                                                <td className="px-10 py-10 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <div className="text-xl font-bold text-emerald-500">
                                                            {Math.round((mentor.totalStudents / (mentor.courseCount || 1)))} Per Course
                                                        </div>
                                                        <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-1">Learner Ratio</div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
