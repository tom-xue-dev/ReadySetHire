import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { I18nProvider } from "./contexts/I18nContext";
import AuthNotification from "./components/AuthNotification";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import ConditionalRoute from "./components/ConditionalRoute";
import Layout from "./layout/layout.tsx";
import HRDashboard from "./pages/HRDashboard";
import Jobs from "./pages/Jobs";
import Default from "./pages/Default.tsx";
import Interviews from "./pages/Interviews.tsx";
import Applicant from "./pages/Applicants.tsx";
import ApplicantPage from "./pages/ApplicantPage.tsx";
import AudioRecorder from "./pages/AudioRecorder.tsx";
import Questions from "./pages/Questions.tsx";
import ResumeAssessment from "./pages/ResumeAssessment.tsx";
import InterviewWelcome from "./pages/InterviewWelcome.tsx";
import InterviewRun from "./pages/InterviewRun.tsx";
import InterviewAnswers from "./pages/InterviewAnswers.tsx";
import InterviewThanks from "./pages/InterviewThanks.tsx";
import Home from "./pages/Home.tsx";
import Settings from "./pages/Settings.tsx";
import ResumeManagement from "./pages/ResumeManagement.tsx";

function AppContent() {
  const { showAuthNotification, hideAuthNotification } = useAuth();
  
  return (
    <>
      {showAuthNotification && (
        <AuthNotification onClose={hideAuthNotification} />
      )}
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ConditionalRoute>
              <Home />
            </ConditionalRoute>
          } />
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<HRDashboard />} />
                  {/* Database-dependent routes with connection checking */}
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/interviews" element={<Interviews />} />
                  <Route path="/interviews/:interviewId/applicants" element={<Applicant />} />
                  <Route path="/interviews/:interviewId/questions" element={<Questions />} />
                  
                  {/* Interview flow routes - may need connection but less critical */}
                  <Route path="/interview-welcome/:interviewId/:applicantId" element={<InterviewWelcome />} />
                  <Route path="/interview-run/:interviewId/:applicantId" element={<InterviewRun />} />
                  <Route path="/interview-thanks/:interviewId/:applicantId" element={<InterviewThanks />} />
                  <Route path="/interview-answers/:interviewId/:applicantId" element={<InterviewAnswers />} />
                  
                  {/* Other routes that may not need immediate database connection */}
                  <Route path="/applicants" element={<ApplicantPage />} />
                  <Route path="/audio-recorder" element={<AudioRecorder />} />
                  <Route path="/resume-assessment" element={<ResumeAssessment />} />
                  <Route path="/resume-management" element={<ResumeManagement />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Default />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        </BrowserRouter>
      </>
    );
  }

function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  )
}

export default App
