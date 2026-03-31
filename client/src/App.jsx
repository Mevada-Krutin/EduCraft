import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import Certificate from './pages/Certificate';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse from './pages/CreateCourse';
import EditCourse from './pages/EditCourse';
import AdminDashboard from './pages/AdminDashboard';

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword/:resettoken" element={<ResetPassword />} />
          <Route path="/certificate/:id" element={<ProtectedRoute><Certificate /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/instructor/dashboard" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />
          <Route path="/instructor/course/create" element={<ProtectedRoute><CreateCourse /></ProtectedRoute>} />
          <Route path="/instructor/course/edit/:id" element={<ProtectedRoute><EditCourse /></ProtectedRoute>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/course/:id" element={<CourseDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
