import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();
  
  return (
    <Layout>
      {/* Header de bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            ¡Hola, <span className="text-blue-600">{session?.user?.name}</span>! 👋
          </h1>
          <p className="text-slate-600 text-lg">
            Bienvenido al panel de administración
          </p>
        </div>
        
        {/* User profile card */}
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="relative">
            <img 
              src={session?.user?.image} 
              alt="Profile" 
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 text-sm">
              {session?.user?.name}
            </span>
            <span className="text-slate-500 text-xs">
              Administrador
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Productos", value: "1,234", color: "blue", icon: "📦" },
          { title: "Órdenes Hoy", value: "42", color: "green", icon: "📋" },
          { title: "Ventas Mensuales", value: "$12,456", color: "purple", icon: "💰" },
          { title: "Clientes Nuevos", value: "28", color: "orange", icon: "👥" }
        ].map((stat, index) => (
          <div 
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
            <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-${stat.color}-500 rounded-full`}
                style={{ width: `${Math.random() * 60 + 40}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Agregar Producto", icon: "➕", color: "blue" },
            { name: "Ver Reportes", icon: "📊", color: "green", href: "/reportes-inventario" },
            { name: "Gestionar Stock", icon: "📦", color: "orange" },
            { name: "Configuración", icon: "⚙️", color: "purple" }
          ].map((action, index) => (
            <button
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all duration-300 border border-slate-200 hover:border-slate-300 group"
            >
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </span>
              <span className="text-sm font-medium text-slate-700 text-center">
                {action.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}