import logo from "../assets/logo_transparent.png";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useI18n } from "../contexts/I18nContext";
import { UserCircleIcon  } from '@heroicons/react/24/solid'

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useI18n();
  return (
    <div className="bg-white min-h-screen relative">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav className="flex items-center justify-between py-6" aria-label="Global">
            <a href="/" className="text-2xl font-bold text-gray-900">
                <img src={logo} style={{ height: 40, width: 'auto' }} className="block object-contain" />
            </a>
          
            <div className="flex items-center gap-x-6">
              {isAuthenticated ? (
                <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 text-white flex items-center justify-center">
                    <UserCircleIcon width={40} height={40} style={{ color: 'black' }} />
                    </div>
                  <span className="hidden sm:inline">{t('home.dashboardLink')}</span>
                </Link>
              ) : (
                <Link to="/login" className="text-sm font-semibold text-gray-900">
                  {t('home.loginLink')} <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </nav>
        </div>
      </header>
    
      <div className="relative isolate px-6 pt-14 lg:px-8 backdrop-blur">
        {/* Top background */}
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-[80px] sm:-top-80">
          <div
            style={{clipPath:'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}
            className="relative left-1/2 aspect-[1155/678] w-[100rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 blur-3xl pointer-events-none sm:w-[140rem]"
          />
        </div>

        {/* Hero content */}
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">{t('home.title')}</h1>
        </div>

        {/* Bottom background */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-[80px] sm:top-[calc(100%-30rem)]">
          <div
            style={{clipPath:'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)'}}
            className="relative left-1/2 aspect-[1155/678] w-[100rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 blur-3xl pointer-events-none sm:w-[140rem]"
          />
        </div>
      </div>
    </div>
  );
}
