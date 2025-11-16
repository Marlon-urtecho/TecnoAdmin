import Logo from "@/components/Logo";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Nav({ show }) {
  const inactiveLink = 'flex gap-3 items-center p-3 transition-all duration-200 hover:bg-white/10 rounded-xl';
  const activeLink = 'flex gap-3 items-center p-3 bg-white/20 text-white rounded-xl shadow-lg backdrop-blur-sm';
  const inactiveIcon = 'w-5 h-5 opacity-80';
  const activeIcon = 'w-5 h-5 text-white';
  
  const router = useRouter();
  const { pathname } = router;

  async function logout() {
    await router.push('/');
    await signOut();
  }

  // Datos de navegación para mejor organización
  const navItems = [
    { 
      href: '/', 
      label: 'Dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      match: (path) => path === '/'
    },
    { 
      href: '/products', 
      label: 'Productos', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      match: (path) => path.includes('/products')
    },
    { 
      href: '/brands', 
      label: 'Marcas', 
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      match: (path) => path.includes('/brands') || path.includes('/marcas')
    },
    { 
      href: '/categories', 
      label: 'Categorías', 
      icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
      match: (path) => path.includes('/categories')
    },
    { 
      href: '/orders', 
      label: 'Órdenes', 
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      match: (path) => path.includes('/orders')
    },
    { 
      href: '/suppliers', 
      label: 'Proveedores', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      match: (path) => path.includes('/suppliers') || path.includes('/proveedores')
    },
    { 
      href: '/sales', 
      label: 'Ventas', 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
      match: (path) => path.includes('/sales') || path.includes('/ventas')
    },
    { 
      href: '/users', 
      label: 'Usuarios', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      match: (path) => path.includes('/users') || path.includes('/usuarios')
    },
    { 
      href: '/settings', 
      label: 'Configuración', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      match: (path) => path.includes('/settings')
    }
  ];

  return (
    <aside className={`
      ${show ? 'left-0' : '-left-full'} 
      top-0 text-white p-6 fixed w-80 bg-gradient-to-b from-slate-900 to-slate-800 
      h-full md:static md:w-80 transition-all duration-300 shadow-2xl
      border-r border-white/10 backdrop-blur-sm flex flex-col
    `}>
      
      {/* Header con logo - Ocupa espacio necesario */}
      <div className="flex-shrink-0 mb-8 border-b border-white/10 pb-6">
        <Logo />
      </div>

      {/* Navegación - Ocupa el espacio restante con scroll si es necesario */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.match(pathname);
          return (
            <Link 
              key={item.href}
              href={item.href} 
              className={isActive ? activeLink : inactiveLink}
            >
              <svg 
                className={isActive ? activeIcon : inactiveIcon} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={item.icon} 
                />
              </svg>
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Espacio flexible para empujar el logout hacia abajo */}
        <div className="flex-1"></div>

        {/* Logout - Siempre en la parte inferior */}
        <div className="flex-shrink-0 pt-4 border-t border-white/10">
          <button 
            onClick={logout} 
            className="flex gap-3 items-center p-3 w-full text-red-300 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200 rounded-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}