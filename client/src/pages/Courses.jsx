import { useState, useEffect } from 'react';
import axios from 'axios';
import CourseCard from '../components/CourseCard';
import { Search } from 'lucide-react';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/courses');
                setCourses(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in mt-4 border-box">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-4">
                <h1 style={{ margin: 0 }}>Browse Courses</h1>

                <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '2.5rem' }}
                    />
                    <Search
                        size={18}
                        className="text-secondary"
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 mt-5">Loading courses...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="card text-center py-5 mt-5">
                    <h3 className="mb-2">No courses found</h3>
                    <p className="text-secondary">Try adjusting your search terms.</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {filteredCourses.map(course => (
                        <CourseCard key={course._id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;
