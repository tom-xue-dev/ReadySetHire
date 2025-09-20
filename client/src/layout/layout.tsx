import type {ReactNode} from "react";
import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar.tsx";
import { useI18n } from "../contexts/I18nContext";
import "./layout.css";

export default function Layout({children}: {children: ReactNode}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { t } = useI18n();

    return (
        <div className="layout">
            <Header />
            <div className="dashboard-container">
                <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
                <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
                    <main className="main">{children}</main>
                </div>
            </div>

            <footer className="footer">{t('common.copyright')}</footer>
        </div>
    )
}
