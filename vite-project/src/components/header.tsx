import { Link } from "react-router-dom";
import "./header.css";

export default function Header() {
    return (
        <header className="header">
            <div className="logo">ReadySetHire</div>
            <nav className="nav">
                <Link to="/">Home</Link>
                <Link to="/interviews">Interviews</Link>
                <Link to="/applicants">Applicants</Link>
                <Link to="/audio-recorder">Audio Recorder</Link>
            </nav>
        </header>
    );
}

