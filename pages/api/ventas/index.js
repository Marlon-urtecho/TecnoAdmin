
import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

export default function VentasPage() {
  const [ventas, setVentas] = useState([]); // Asegurar que siempre sea array
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    estado: '',
    metodoPago: ''
  });

  useEffect(() => {
    loadVentas();
    loadEstadisticas();
  }, [filters]);

  const loadVentas = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.metodoPago) params.append('metodoPago', filters.metodoPago);

      const response = await axios.get(`/api/ventas?${params}`);
      
      // Asegurar que siempre sea un array
      setVentas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error cargando ventas:', error);
      setVentas([]); // En caso de error, establecer array vacío
    }
  };

  const loadEstadisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);

      const response = await axios.get(`/api/ventas/estadisticas?${params}`);
      setEstadisticas(response.data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colors = {
      pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmado: 'bg-blue-100 text-blue-800 border-blue-200',
      procesando: 'bg-purple-100 text-purple-800 border-purple-200',
      enviado: 'bg-teal-100 text-teal-800 border-teal-200',
      entregado: 'bg-green-100 text-green-800 border-green-200',
      cancelado: 'bg-red-100 text-red-800 border-red-200',
      pagado: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getEstadoTexto = (estado) => {
    const estados = {
      pendiente: 'Pendiente',
      confirmado: 'Confirmado',
      procesando: 'Procesando',
      enviado: 'Enviado',
      entregado: 'Entregado',
      cancelado: 'Cancelado',
      pagado: 'Pagado'
    };
    return estados[estado] || estado;
  };

  const formatMoneda = (monto) => {
    if (typeof monto !== 'number') return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  const formatFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando ventas...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestión de Ventas</h1>
              <p className="text-gray-600">Administra y monitorea todas tus ventas</p>
            </div>
            <Link
              href="/orders/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Nueva Venta
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filters.fechaInicio}
                onChange={(e) => setFilters({...filters, fechaInicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filters.fechaFin}
                onChange={(e) => setFilters({...filters, fechaFin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filters.estado}
                onChange={(e) => setFilters({...filters, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="procesando">Procesando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método Pago</label>
              <select
                value={filters.metodoPago}
                onChange={(e) => setFilters({...filters, metodoPago: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los métodos</option>
                <option value="pagado">Pagado</option>
                <option value="pendiente">Pendiente</option>
                <option value="fallido">Fallido</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalVentas || 0}</p>
                  <p className="text-sm text-green-600">
                    {estadisticas.ventasHoy || 0} hoy
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatMoneda(estadisticas.ingresosTotales || 0)}
                  </p>
                  <p className="text-sm text-blue-600">
                    {formatMoneda(estadisticas.ingresosPromedio || 0)} promedio
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 text-xl">📈</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.totalProductosVendidos || 0}</p>
                  <p className="text-sm text-purple-600">
                    {estadisticas.productosPorVenta || 0} por venta
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 text-xl">📦</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
                  <p className="text-2xl font-bold text-gray-900">{estadisticas.tasaConversion || 0}%</p>
                  <p className="text-sm text-teal-600">
                    {estadisticas.clientesRecurrentes || 0} clientes recurrentes
                  </p>
                </div>
                <div className="p-3 bg-teal-100 rounded-lg">
                  <span className="text-teal-600 text-xl">👥</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Ventas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Ventas Recientes</h2>
            <span className="text-sm text-gray-500">
              {Array.isArray(ventas) ? ventas.length : 0} ventas encontradas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Orden</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cliente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Estado</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Pago</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Productos</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(ventas) && ventas.length > 0 ? (
                  ventas.map((venta) => (
                    <tr key={venta.pedido_id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/orders/${venta.pedido_id}`} className="font-medium text-blue-600 hover:text-blue-800">
                          #{venta.numero_pedido}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{venta.correo_cliente}</div>
                          {venta.telefono_cliente && (
                            <div className="text-sm text-gray-500">{venta.telefono_cliente}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{formatFecha(venta.fecha_creacion)}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoColor(venta.estado)}`}>
                          {getEstadoTexto(venta.estado)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          venta.estado_pago === 'pagado' ? 'bg-green-100 text-green-800' :
                          venta.estado_pago === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {venta.estado_pago}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-gray-900">
                        {formatMoneda(venta.monto_total)}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {Array.isArray(venta.items) ? venta.items.length : 0} productos
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/orders/${venta.pedido_id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver
                          </Link>
                          {venta.estado === 'pendiente' && (
                            <button className="text-green-600 hover:text-green-800 text-sm">
                              Procesar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                      No se encontraron ventas con los filtros aplicados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas Adicionales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Ventas por Estado</h3>
              <div className="space-y-2">
                {estadisticas.ventasPorEstado && Object.entries(estadisticas.ventasPorEstado).map(([estado, cantidad]) => (
                  <div key={estado} className="flex justify-between">
                    <span className="text-gray-600 capitalize">{estado}:</span>
                    <span className="font-medium">{cantidad}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Métricas de Desempeño</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ticket promedio:</span>
                  <span className="font-medium">{formatMoneda(estadisticas.ingresosPromedio || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Productos por venta:</span>
                  <span className="font-medium">{estadisticas.productosPorVenta || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ventas hoy:</span>
                  <span className="font-medium text-green-600">{estadisticas.ventasHoy || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link href="/orders/new" className="flex items-center text-blue-600 hover:text-blue-800">
                  <span>+ Crear nueva venta</span>
                </Link>
                <Link href="/reportes-ventas" className="flex items-center text-purple-600 hover:text-purple-800">
                  <span>📊 Ver reportes detallados</span>
                </Link>
                <button onClick={loadVentas} className="flex items-center text-gray-600 hover:text-gray-800">
                  <span>🔄 Actualizar datos</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}