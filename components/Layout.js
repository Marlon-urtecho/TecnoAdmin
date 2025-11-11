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
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-100 via-white to-sky-200">
        <div className="bg-white shadow-lg rounded-2xl p-10 text-center w-80 transition-all">
          <Logo />
          <h1 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">Welcome</h1>
          <p className="text-gray-500 text-sm mb-6">
            Please sign in with your Google account to continue.
          </p>
          <button
            onClick={() => signIn("google")}
            className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-2 rounded-xl shadow transition-all duration-300"
          >
            Login with Google
          </button>
        </div>
        <footer className="absolute bottom-4 text-gray-400 text-xs">
          © {new Date().getFullYear()} — My Admin Panel
        </footer>
      </div>
    );
  }

  // --- MAIN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-800 flex flex-col">
      {/* Top Bar (mobile) */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-white shadow-sm sticky top-0 z-40">
        <button
          onClick={() => setShowNav(!showNav)}
          className="text-gray-600 hover:text-blue-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-7 h-7"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 
               010 1.5H3.75A.75.75 0 013 6.75zM3 
               12a.75.75 0 01.75-.75h16.5a.75.75 
               0 010 1.5H3.75A.75.75 0 013 
               12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 
               0 010 1.5H3.75a.75.75 0 
               01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="flex-grow flex justify-center">
          <Logo />
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex flex-grow">
        {/* Sidebar */}
        <Nav show={showNav} />

        {/* Content */}
        <main
          className="flex-grow p-6 md:p-8 transition-all duration-300 bg-white md:rounded-tl-2xl md:shadow-inner"
          onClick={() => showNav && setShowNav(false)} // close nav on click outside (mobile)
        >
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
