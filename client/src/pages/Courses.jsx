import { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import CourseCard from '../components/CourseCard';
import { 
  Search, Filter, X, ChevronRight, 
  RefreshCcw, Grid, List as ListIcon 
} from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await api.get('/api/courses');
                setCourses(data.courses || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const categories = ['All', ...new Set(courses.map(c => c.category))];

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#0f172a] pb-20 fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight uppercase">
                        Browse Courses
                    </h1>
                    
                    <div className="relative w-full md:w-[400px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search courses..."
                            className="w-full bg-[#1e293b] border border-slate-700 h-14 pl-12 pr-6 rounded-xl text-white placeholder:text-slate-500 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Filter Bar */}
                <div className="flex bg-[#1e293b] p-1.5 rounded-2xl border border-slate-700/50 mb-12 overflow-x-auto scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                                selectedCategory === cat 
                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Course Grid */}
                <div className="flex-1 w-full">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                            Showing <span className="text-white">{filteredCourses.length}</span> Courses
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-80 rounded-2xl bg-[#1e293b]/50 animate-pulse border border-slate-700/30"></div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="p-24 bg-[#1e293b] border border-dashed border-slate-700 rounded-[3rem] flex flex-col items-center text-center gap-6">
                            <p className="text-slate-400 text-lg">No courses found matching your search.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
                                className="btn-primary"
                            >
                                Reset Search
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredCourses.map(course => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Courses;
