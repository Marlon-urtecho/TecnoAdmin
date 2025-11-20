// pages/orders/index.js
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

// Funciones auxiliares para estados (las movemos fuera del componente)
const getEstadoTexto = (estado) => {
  const estados = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    procesando: 'Procesando',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
    reembolsado: 'Reembolsado'
  };
  return estados[estado] || estado;
};

const getEstadoPagoTexto = (estadoPago) => {
  const estados = {
    pendiente: 'Pendiente',
    procesando: 'Procesando',
    pagado: 'Pagado',
    fallido: 'Fallido',
    reembolsado: 'Reembolsado',
    parcialmente_reembolsado: 'Parcialmente Reembolsado'
  };
  return estados[estadoPago] || estadoPago;
};

const getEstadoClass = (estado) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    confirmado: 'bg-blue-100 text-blue-800 border-blue-200',
    procesando: 'bg-purple-100 text-purple-800 border-purple-200',
    enviado: 'bg-teal-100 text-teal-800 border-teal-200',
    entregado: 'bg-green-100 text-green-800 border-green-200',
    cancelado: 'bg-red-100 text-red-800 border-red-200',
    reembolsado: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return classes[estado] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getEstadoPagoClass = (estadoPago) => {
  const classes = {
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    procesando: 'bg-blue-100 text-blue-800 border-blue-200',
    pagado: 'bg-green-100 text-green-800 border-green-200',
    fallido: 'bg-red-100 text-red-800 border-red-200',
    reembolsado: 'bg-gray-100 text-gray-800 border-gray-200',
    parcialmente_reembolsado: 'bg-orange-100 text-orange-800 border-orange-200'
  };
  return classes[estadoPago] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    estadoPago: '',
    search: ''
  });
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar órdenes
  const filteredOrders = orders.filter(order => {
    const matchesEstado = !filters.estado || order.estado === filters.estado;
    const matchesEstadoPago = !filters.estadoPago || order.estado_pago === filters.estadoPago;
    const matchesSearch = !filters.search || 
      order.numero_pedido?.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.info_cliente?.nombre?.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.info_cliente?.email?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesEstado && matchesEstadoPago && matchesSearch;
  });

  // Función para actualizar estado de orden
  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdating(prev => ({ ...prev, [orderId]: true }));
    try {
      await axios.put(`/api/orders/${orderId}`, { estado: newStatus });
      await loadOrders(); // Recargar órdenes
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error al actualizar la orden');
    } finally {
      setUpdating(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Función para determinar si se puede editar una orden
  const puedeEditar = (estado) => {
    return ['pendiente', 'confirmado', 'procesando'].includes(estado);
  };

  // Función para determinar si se puede cancelar una orden
  const puedeCancelar = (estado) => {
    return ['pendiente', 'confirmado', 'procesando'].includes(estado);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando órdenes...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header con botón de nueva orden */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Órdenes</h1>
            <p className="text-gray-600">Administra y sigue el estado de los pedidos</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Total: {filteredOrders.length} órdenes
            </span>
            <Link
              href="/orders/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
            >
              + Nueva Orden
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="#Orden, cliente, email..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado Pago</label>
            <select
              value={filters.estadoPago}
              onChange={(e) => setFilters({...filters, estadoPago: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los pagos</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="pagado">Pagado</option>
              <option value="fallido">Fallido</option>
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ estado: '', estadoPago: '', search: '' })}
              className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Orden
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Cliente
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Pago
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Total
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Productos
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? filteredOrders.map(order => (
                <tr key={order.pedido_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      <Link href={`/orders/${order.pedido_id}`} className="hover:text-blue-600 transition-colors">
                        #{order.numero_pedido}
                      </Link>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.fecha_creacion).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(order.fecha_creacion).toLocaleTimeString('es-ES')}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      {order.correo_cliente}
                    </div>
                    {order.telefono_cliente && (
                      <div className="text-xs text-gray-500">
                        📞 {order.telefono_cliente}
                      </div>
                    )}
                    {order.usuario && (
                      <div className="text-xs text-green-600 font-medium">
                        Usuario registrado
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="flex flex-col space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoClass(order.estado)}`}>
                        {getEstadoTexto(order.estado)}
                      </span>
                      
                      {puedeEditar(order.estado) && (
                        <select
                          value={order.estado}
                          onChange={(e) => updateOrderStatus(order.pedido_id, e.target.value)}
                          disabled={updating[order.pedido_id]}
                          className="text-xs border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmado">Confirmado</option>
                          <option value="procesando">Procesando</option>
                          <option value="enviado">Enviado</option>
                          <option value="entregado">Entregado</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getEstadoPagoClass(order.estado_pago)}`}>
                      {getEstadoPagoTexto(order.estado_pago)}
                    </span>
                    {order.fecha_pago && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.fecha_pago).toLocaleDateString('es-ES')}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.monto_total?.toFixed(2) || '0.00'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.items?.reduce((sum, item) => sum + item.cantidad, 0) || 0} items
                    </div>
                    {order.monto_descuento > 0 && (
                      <div className="text-xs text-green-600">
                        -${order.monto_descuento?.toFixed(2)}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="space-y-1 max-w-xs">
                      {order.items?.slice(0, 2).map((item) => (
                        <div key={item.item_pedido_id} className="text-sm">
                          <span className="font-medium truncate">{item.nombre_producto}</span>
                          <span className="text-gray-600"> x{item.cantidad}</span>
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{order.items.length - 2} más...
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="flex flex-col space-y-2">
                      <Link
                        href={`/orders/${order.pedido_id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm transition-colors"
                      >
                        Ver Detalles
                      </Link>
                      
                      {puedeCancelar(order.estado) && (
                        <button
                          onClick={() => {
                            if (confirm('¿Estás seguro de que quieres cancelar esta orden?')) {
                              updateOrderStatus(order.pedido_id, 'cancelado');
                            }
                          }}
                          disabled={updating[order.pedido_id]}
                          className="text-red-600 hover:text-red-900 text-sm transition-colors disabled:opacity-50"
                        >
                          {updating[order.pedido_id] ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-12 px-4 text-center">
                    <div className="text-gray-500 mb-4">
                      <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-2">No se encontraron órdenes</p>
                    <p className="text-gray-400 text-sm mb-4">
                      {orders.length === 0 
                        ? "No hay órdenes en el sistema" 
                        : "No hay órdenes que coincidan con los filtros aplicados"
                      }
                    </p>
                    {orders.length === 0 && (
                      <Link
                        href="/orders/new"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        + Crear Primera Orden
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen estadístico */}
        {orders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Ventas</div>
              <div className="text-2xl font-bold text-blue-700">
                ${orders.reduce((sum, order) => sum + (order.monto_total || 0), 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">Órdenes Pagadas</div>
              <div className="text-2xl font-bold text-green-700">
                {orders.filter(order => order.estado_pago === 'pagado').length}
              </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="text-sm text-orange-600 font-medium">Pendientes</div>
              <div className="text-2xl font-bold text-orange-700">
                {orders.filter(order => order.estado === 'pendiente').length}
              </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Productos Vendidos</div>
              <div className="text-2xl font-bold text-purple-700">
                {orders.reduce((sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + item.cantidad, 0) || 0), 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}