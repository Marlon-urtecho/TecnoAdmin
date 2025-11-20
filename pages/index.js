import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        axios.get('/api/dashboard/stats'),
        axios.get('/api/dashboard/activity')
      ]);

      setStats(statsResponse.data);
      setActivity(activityResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      procesando: 'bg-purple-100 text-purple-800',
      enviado: 'bg-teal-100 text-teal-800',
      entregado: 'bg-green-100 text-green-800',
      pagado: 'bg-green-100 text-green-800',
      completado: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const statusMap = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      procesando: 'Procesando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      pagado: 'Pagado',
      completado: 'Completado'
    };
    return statusMap[status] || status;
  };

  const getActivityIcon = (type) => {
    const icons = {
      orden: '🛒',
      inventario: '📦',
      cliente: '👤',
      producto: '🏷️'
    };
    return icons[type] || '📋';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando dashboard...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Resumen general de tu negocio</p>
        </div>

        {/* Acciones Rápidas - ACTUALIZADO */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link href="/orders/new" className="bg-blue-50 p-4 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-lg">🛒</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-blue-900">Nueva Orden</h3>
                  <p className="text-blue-600 text-sm">Crear orden manual</p>
                </div>
              </div>
            </Link>

            <Link href="/inventario" className="bg-green-50 p-4 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-lg">📦</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-green-900">Gestionar Inventario</h3>
                  <p className="text-green-600 text-sm">Ver stock y ajustes</p>
                </div>
              </div>
            </Link>

            <Link href="/reportes-inventario" className="bg-purple-50 p-4 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-lg">📊</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-purple-900">Reportes</h3>
                  <p className="text-purple-600 text-sm">Ver reportes inventario</p>
                </div>
              </div>
            </Link>

            <Link href="/products" className="bg-orange-50 p-4 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <span className="text-orange-600 text-lg">🏷️</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-orange-900">Productos</h3>
                  <p className="text-orange-600 text-sm">Gestionar productos</p>
                </div>
              </div>
            </Link>

            <Link href="/orders" className="bg-red-50 p-4 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-red-600 text-lg">📋</span>
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-red-900">Ver Órdenes</h3>
                  <p className="text-red-600 text-sm">Todas las órdenes</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Estadísticas Principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total de Ingresos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.resumen.ingresos_totales.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm ${stats.resumen.crecimiento_ingresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats.resumen.crecimiento_ingresos >= 0 ? '↗' : '↘'} 
                    {Math.abs(stats.resumen.crecimiento_ingresos)}% vs mes anterior
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>

            {/* Total de Órdenes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Órdenes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resumen.total_ordenes}</p>
                  <p className="text-sm text-orange-600">
                    {stats.resumen.ordenes_pendientes} pendientes
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">🛒</span>
                </div>
              </div>
            </div>

            {/* Total de Productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resumen.total_productos}</p>
                  <p className="text-sm text-red-600">
                    {stats.inventario.stock_bajo} con stock bajo
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-xl">📦</span>
                </div>
              </div>
            </div>

            {/* Total de Clientes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resumen.total_clientes}</p>
                  <p className="text-sm text-gray-600">
                    Tasa de conversión: {stats.metricas_rapidas.tasa_conversion}%
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <span className="text-teal-600 text-xl">👥</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de Inventario - NUEVA SECCIÓN */}
        {stats && (stats.inventario.stock_bajo > 0 || stats.inventario.sin_stock > 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg mr-4">
                  <span className="text-orange-600 text-xl">⚠️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Alertas de Inventario</h3>
                  <p className="text-gray-600">
                    {stats.inventario.stock_bajo > 0 && `${stats.inventario.stock_bajo} productos con stock bajo`}
                    {stats.inventario.stock_bajo > 0 && stats.inventario.sin_stock > 0 && ' • '}
                    {stats.inventario.sin_stock > 0 && `${stats.inventario.sin_stock} productos agotados`}
                  </p>
                </div>
              </div>
              <Link 
                href="/reportes-inventario" 
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Ver Reportes
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Órdenes Recientes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Órdenes Recientes</h2>
              <Link href="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-3">
              {stats?.ordenes_recientes.map((order) => (
                <Link 
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">#{order.numero}</div>
                    <div className="text-sm text-gray-600">{order.cliente}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">${order.total}</div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.estado)}`}>
                      {getStatusText(order.estado)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Actividad Reciente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Actividad Reciente</h2>
              <button 
                onClick={loadDashboardData}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                Actualizar
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activity.map((item) => (
                <Link
                  key={item.id}
                  href={item.action}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">{getActivityIcon(item.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.title}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {item.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleDateString('es-ES')} a las{' '}
                      {new Date(item.timestamp).toLocaleTimeString('es-ES', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </Link>
              ))}
              {activity.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No hay actividad reciente
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Métricas Adicionales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Estado del Inventario</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos con stock bajo:</span>
                  <span className="font-medium text-orange-600">{stats.inventario.stock_bajo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos sin stock:</span>
                  <span className="font-medium text-red-600">{stats.inventario.sin_stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock saludable:</span>
                  <span className="font-medium text-green-600">{stats.inventario.porcentaje_stock_saludable}%</span>
                </div>
                <div className="pt-2 mt-2 border-t">
                  <Link 
                    href="/reportes-inventario" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Ver reportes detallados →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Métricas de Ventas</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor promedio por orden:</span>
                  <span className="font-medium">${stats.metricas_rapidas.valor_promedio_orden.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos por orden:</span>
                  <span className="font-medium">{stats.metricas_rapidas.productos_por_orden._avg.cantidad?.toFixed(1) || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de conversión:</span>
                  <span className="font-medium">{stats.metricas_rapidas.tasa_conversion}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Acciones Pendientes</h3>
              <div className="space-y-3">
                {stats.resumen.ordenes_pendientes > 0 && (
                  <Link href="/orders?estado=pendiente" className="flex items-center justify-between text-orange-600 hover:text-orange-800">
                    <span>Órdenes pendientes</span>
                    <span className="font-medium">{stats.resumen.ordenes_pendientes}</span>
                  </Link>
                )}
                {stats.inventario.stock_bajo > 0 && (
                  <Link href="/reportes-inventario" className="flex items-center justify-between text-red-600 hover:text-red-800">
                    <span>Productos con stock bajo</span>
                    <span className="font-medium">{stats.inventario.stock_bajo}</span>
                  </Link>
                )}
                {stats.inventario.sin_stock > 0 && (
                  <Link href="/reportes-inventario" className="flex items-center justify-between text-red-600 hover:text-red-800">
                    <span>Productos sin stock</span>
                    <span className="font-medium">{stats.inventario.sin_stock}</span>
                  </Link>
                )}
                {(stats.resumen.ordenes_pendientes === 0 && stats.inventario.stock_bajo === 0 && stats.inventario.sin_stock === 0) && (
                  <div className="text-green-600 text-sm">
                    ✅ Todas las tareas están al día
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}