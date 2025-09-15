import './App.css'
import Layout from "./layout/layout.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home.tsx";
import Default from "./pages/Default.tsx";
import Interviews from "./pages/Interviews.tsx";
import Applicants from "./pages/Applicants.tsx";
import AudioRecorder from "./pages/AudioRecorder.tsx";
import Questions from "./pages/Questions.tsx";
import InterviewDetail from "./pages/InterviewDetail.tsx";
import ResumeAssessment from "./pages/ResumeAssessment.tsx";


function App() {

  return (
    <BrowserRouter>
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/applicants" element={<Applicants />} />
                <Route path="/audio-recorder" element={<AudioRecorder />} />
                <Route path="/resume-assessment" element={<ResumeAssessment />} />
                <Route path="/interviews/:id" element={<InterviewDetail />}>
                    <Route index element={<Navigate to="questions" replace />} />
                    <Route path="questions" element={<Questions />} />
                    <Route path="applicants" element={<Applicants />} />
                </Route>
                <Route path="*" element={<Default />} />
            </Routes>
        </Layout>
    </BrowserRouter>
  )
}

export default App
