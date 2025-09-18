import { Link } from "react-router-dom";
import recruiterImg from "../assets/recruiter.png";
import applicantImg from "../assets/applicant.png";
import Starfield from "../components/Starfield";
import "./Home.css";

export default function Home() {
    return (
        <section className="home-root">
            <Starfield />
            <div className="home-hero">
                <div className="home-hero-content">
                    <h1 className="home-title">ReadySetHire — An all-in-one recruitment management platform.</h1>
                    <p className="home-subtitle">
                        Here, HR teams can easily publish job descriptions (JDs), manage candidate resumes in one place,
                        schedule interviews, and conduct online assessments. Simplify your hiring process, improve
                        efficiency, and find the right talent faster.
                    </p>
                </div>
            </div>

            <div className="home-container">
                <Link to="/interviews" className="home-card" aria-label="Go to Interviews">
                    <img className="home-image" src={recruiterImg} alt="Recruiter" />
                    <div className="home-overlay">I am recruiter</div>
                </Link>
                <Link to="/applicant" className="home-card" aria-label="Go to Default">
                    <img className="home-image" src={applicantImg} alt="Applicant" />
                    <div className="home-overlay">I am applicant</div>
                </Link>
            </div>
        </section>
    );
}
