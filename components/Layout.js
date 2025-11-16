import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import Nav from "@/components/Nav";
import Logo from "@/components/Logo";

export default function Layout({ children }) {
  const [showNav, setShowNav] = useState(false);
  const { data: session } = useSession();

  // --- LOGIN SCREEN ---
  if (!session) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        {/* Efectos de fondo */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-12 text-center w-96 shadow-2xl transition-all duration-500 z-10">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Bienvenido</h1>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            Inicia sesión con tu cuenta de Google para acceder al panel de administración.
          </p>
          <button
            onClick={() => signIn("google")}
            className="w-full bg-white hover:bg-slate-100 text-slate-900 font-semibold px-6 py-4 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuar con Google</span>
          </button>
        </div>
        
        <footer className="absolute bottom-6 text-slate-500 text-sm backdrop-blur-sm bg-slate-900/30 px-4 py-2 rounded-full">
          © {new Date().getFullYear()} — Admin Panel v2.0
        </footer>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 text-slate-900 flex flex-col">
      {/* Top Bar (mobile) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => setShowNav(!showNav)}
          className="text-slate-600 hover:text-blue-600 transition-all duration-300 p-2 rounded-lg hover:bg-slate-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="flex-grow flex justify-center">
          <Logo />
        </div>
        <div className="w-10"> {/* Spacer para balance */} </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Nav show={showNav} />

        {/* Content */}
        <main
          className="flex-grow p-6 md:p-8 transition-all duration-300 bg-white/60 backdrop-blur-sm md:rounded-tl-3xl md:shadow-sm min-h-screen"
          onClick={() => showNav && setShowNav(false)}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}