import './App.css'
import Layout from "./layout/layout.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { ConnectionGuard } from "./components/ConnectionStatus";
import Home from "./pages/Home.tsx";
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


function App() {

  return (
    <BrowserRouter>
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                {/* Database-dependent routes with connection checking */}
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
        </Layout>
    </BrowserRouter>
  )
}

export default App
