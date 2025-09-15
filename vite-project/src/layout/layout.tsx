import type {ReactNode} from "react";
import Header from "../components/header.tsx";
import "./layout.css";

export default function Layout({children}: {children: ReactNode}) {
    return (
        <div className="layout">
            <div className="sticky">
                <Header />
            </div>

            <main className="main">{children}</main>

            <footer className="footer">© 2025</footer>
        </div>
    )
}
