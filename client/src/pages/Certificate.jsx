import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Download, Award, ShieldCheck } from 'lucide-react';

const Certificate = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                // Fetch enrollments to verify 100% completion
                const { data: enrollments } = await axios.get('http://localhost:5000/api/users/enrollments', config);
                const targetEnrollment = enrollments.find(e => e.course._id === id || (e.course && e.course._id === id));
                
                if (!targetEnrollment) {
                    setError('Enrollment not found.');
                    setLoading(false);
                    return;
                }

                if (targetEnrollment.progress < 100) {
                    setError('You have not completed this course yet.');
                    setLoading(false);
                    return;
                }

                if (targetEnrollment.course?.quizzes?.length > 0 && !targetEnrollment.passedQuiz) {
                    setError('You must pass the final exam to get your certificate.');
                    setLoading(false);
                    return;
                }

                setEnrollment(targetEnrollment);
                setCourse(targetEnrollment.course);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Failed to load certificate data.');
                setLoading(false);
            }
        };

        if (user) {
            fetchCertificateData();
        }
    }, [id, user]);

    const handleDownload = () => {
        window.print();
    };

    if (loading) return <div className="text-center py-5 mt-5">Verifying Certificate...</div>;
    if (error) return <div className="text-center py-5 mt-5 text-red-500">{error}</div>;
    if (!course) return <div className="text-center py-5 mt-5">Course not found</div>;

    const completionDate = new Date(enrollment.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="animate-fade-in mt-4 flex flex-col items-center">
            
            <div className="flex justify-between items-center w-full max-w-4xl mb-4 print-hide">
                <h2 style={{ margin: 0 }}>Certificate of Completion</h2>
                <button className="btn btn-primary flex items-center gap-2" onClick={handleDownload}>
                    <Download size={18} /> Download / Print
                </button>
            </div>

            <div 
                ref={certificateRef}
                className="certificate-container print-area"
                style={{
                    width: '100%',
                    maxWidth: '900px',
                    backgroundColor: '#ffffff',
                    color: '#1e293b',
                    padding: '3rem',
                    border: '15px solid #0f172a',
                    outline: '4px solid #818cf8',
                    outlineOffset: '-24px',
                    position: 'relative',
                    textAlign: 'center',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Background decorative elements */}
                <div style={{ position: 'absolute', top: '40px', left: '40px', opacity: 0.1 }}>
                    <ShieldCheck size={120} color="#818cf8" />
                </div>
                <div style={{ position: 'absolute', bottom: '40px', right: '40px', opacity: 0.1 }}>
                    <Award size={120} color="#818cf8" />
                </div>

                <div style={{ marginBottom: '3rem', marginTop: '2rem' }}>
                    <h1 style={{ fontSize: '3.5rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0f172a', margin: 0, fontFamily: 'serif' }}>
                        Certificate
                    </h1>
                    <h3 style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 400, letterSpacing: '0.2em', margin: '0.5rem 0 0 0' }}>
                        OF COMPLETION
                    </h3>
                </div>

                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1rem' }}>This is to certify that</p>
                <h2 style={{ fontSize: '3rem', color: '#4338ca', marginBottom: '2rem', fontFamily: 'serif', fontStyle: 'italic', borderBottom: '2px solid #e2e8f0', display: 'inline-block', padding: '0 2rem 0.5rem 2rem' }}>
                    {user.name}
                </h2>

                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '1rem' }}>has successfully completed the course</p>
                <h3 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '3rem', fontWeight: 600 }}>
                    {course.title}
                </h3>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4rem', padding: '0 3rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ borderBottom: '1px solid #94a3b8', width: '200px', marginBottom: '0.5rem', paddingBottom: '0.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
                            {completionDate}
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Date of Completion</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Award size={64} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                        <span style={{ fontWeight: 700, color: '#0f172a', letterSpacing: '2px' }}>EDUCRAFT</span>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ 
                            borderBottom: '1px solid #94a3b8', 
                            width: '200px', 
                            marginBottom: '0.5rem', 
                            paddingBottom: '0.5rem', 
                            fontSize: '1.75rem', 
                            fontWeight: 500, 
                            fontFamily: "'Brush Script MT', 'Lucida Handwriting', 'Pacifico', cursive",
                            color: '#1e293b',
                            lineHeight: '1'
                        }}>
                            {course.instructor?.name || 'EduCraft Instructor'}
                        </div>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Authorized Signature</span>
                    </div>
                </div>
            </div>
            
            {/* CSS for Printing */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-area, .print-area * {
                        visibility: visible;
                    }
                    .print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        height: 100vh !important;
                        box-shadow: none !important;
                        border: 10px solid #0f172a !important;
                    }
                    .print-hide {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Certificate;
