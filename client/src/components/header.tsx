import { Link } from "react-router-dom";
import "./header.css";

export default function Header() {
    return (
        <header className="header">
            <div className="logo">
                <Link to="/">ReadySetHire</Link>
            </div>
            <nav className="nav">
                <Link to="/interviews">Interviews</Link>
                <Link to="/audio-recorder">Audio Recorder</Link>
            </nav>
        </header>
    );
}

