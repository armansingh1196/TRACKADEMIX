import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from 'react-redux';

// Public Pages
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import ChooseUser from './pages/ChooseUser';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';

const App = () => {
  const { currentRole } = useSelector(state => state.user);

  // Authenticated Routes
  if (currentRole === "Admin") {
    return (
      <Router>
        <AdminDashboard />
      </Router>
    );
  }

  if (currentRole === "Student") {
    return (
      <Router>
        <StudentDashboard />
      </Router>
    );
  }

  if (currentRole === "Teacher") {
    return (
      <Router>
        <TeacherDashboard />
      </Router>
    );
  }

  // Public Routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/choose" element={<ChooseUser visitor="normal" />} />
        <Route path="/chooseasguest" element={<ChooseUser visitor="guest" />} />

        <Route path="/Adminlogin" element={<LoginPage role="Admin" />} />
        <Route path="/Studentlogin" element={<LoginPage role="Student" />} />
        <Route path="/Teacherlogin" element={<LoginPage role="Teacher" />} />

        <Route path="/Adminregister" element={<AdminRegisterPage />} />

        <Route path='*' element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
