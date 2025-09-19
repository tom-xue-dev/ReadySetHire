import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import HRDashboard from "./pages/HRDashboard";
import Jobs from "./pages/Jobs";
import Default from "./pages/Default.tsx";
import Interviews from "./pages/Interviews.tsx";
import Applicants from "./pages/Applicants.tsx";
import ApplicantPage from "./pages/ApplicantPage.tsx";
import AudioRecorder from "./pages/AudioRecorder.tsx";
import Questions from "./pages/Questions.tsx";
import InterviewDetail from "./pages/InterviewDetail.tsx";
import ResumeAssessment from "./pages/ResumeAssessment.tsx";
import InterviewWelcome from "./pages/InterviewWelcome.tsx";
import InterviewRun from "./pages/InterviewRun.tsx";
import InterviewThanks from "./pages/InterviewThanks.tsx";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <div style={{ display: 'flex' }}>
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div style={{ 
                  flex: 1, 
                  marginLeft: sidebarOpen ? '280px' : '0',
                  transition: 'margin-left 0.3s ease'
                }}>
                  <Navbar onMenuClick={() => setSidebarOpen(true)} />
                  <Routes>
                    <Route path="/" element={<HRDashboard />} />
                    <Route path="/dashboard" element={<HRDashboard />} />
                    {/* Database-dependent routes with connection checking */}
                    <Route path="/jobs" element={<Jobs />} />
                    <Route path="/interviews" element={<Interviews />} />
                    <Route path="/applicants" element={<Applicants />} />
                    <Route path="/interviews/:id" element={<InterviewDetail />}>
                      <Route index element={<Navigate to="questions" replace />} />
                      <Route path="questions" element={<Questions />} />
                      <Route path="applicants" element={<Applicants />} />
                    </Route>
                    
                    {/* Interview flow routes - may need connection but less critical */}
                    <Route path="/interview-welcome/:interviewId/:applicantId" element={<InterviewWelcome />} />
                    <Route path="/interview-run/:interviewId/:applicantId" element={<InterviewRun />} />
                    <Route path="/interview-thanks/:interviewId/:applicantId" element={<InterviewThanks />} />
                    
                    {/* Other routes that may not need immediate database connection */}
                    <Route path="/applicant" element={<ApplicantPage />} />
                    <Route path="/audio-recorder" element={<AudioRecorder />} />
                    <Route path="/resume-assessment" element={<ResumeAssessment />} />
                    <Route path="*" element={<Default />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
