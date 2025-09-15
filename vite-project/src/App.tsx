import './App.css'
import Layout from "./layout/layout.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home.tsx";
import Default from "./pages/Default.tsx";
import Interviews from "./pages/Interviews.tsx";
import Applicants from "./pages/Applicants.tsx";
import AudioRecorder from "./pages/AudioRecorder.tsx";
import Questions from "./pages/Questions.tsx";


function App() {

  return (
    <BrowserRouter>
        <Layout>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/interviews" element={<Interviews />} />
                <Route path="/applicants" element={<Applicants />} />
                <Route path="/audio-recorder" element={<AudioRecorder />} />
                <Route path="/interviews/:id/questions" element={<Questions />} />
                <Route path="*" element={<Default />} />
            </Routes>
        </Layout>
    </BrowserRouter>
  )
}

export default App
