import Layout from "@/components/Layout";
import {useEffect, useState} from "react";
import axios from "axios";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders')
      .then(response => {
        setOrders(response.data);
      })
      .catch(error => {
        console.error('Error fetching orders:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Función para obtener el texto del estado
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

  // Función para obtener el texto del estado de pago
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

  // Función para obtener la clase CSS del estado
  const getEstadoClass = (estado) => {
    const classes = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmado: 'bg-blue-100 text-blue-800',
      procesando: 'bg-purple-100 text-purple-800',
      enviado: 'bg-teal-100 text-teal-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800',
      reembolsado: 'bg-gray-100 text-gray-800'
    };
    return classes[estado] || 'bg-gray-100 text-gray-800';
  };

  // Función para obtener la clase CSS del estado de pago
  const getEstadoPagoClass = (estadoPago) => {
    const classes = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      procesando: 'bg-blue-100 text-blue-800',
      pagado: 'bg-green-100 text-green-800',
      fallido: 'bg-red-100 text-red-800',
      reembolsado: 'bg-gray-100 text-gray-800',
      parcialmente_reembolsado: 'bg-orange-100 text-orange-800'
    };
    return classes[estadoPago] || 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>
          <span className="text-sm text-gray-500">
            Total: {orders.length} órdenes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Orden
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Fecha
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.length > 0 ? orders.map(order => (
                <tr key={order.pedido_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.numero_pedido}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {order.pedido_id.substring(0, 8)}...
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {new Date(order.fechas.creacion).toLocaleDateString('es-ES')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(order.fechas.creacion).toLocaleTimeString('es-ES')}
                    </div>
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      {order.info_cliente.nombre}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.info_cliente.email}
                    </div>
                    {order.info_cliente.telefono && (
                      <div className="text-xs text-gray-500">
                        📞 {order.info_cliente.telefono}
                      </div>
                    )}
                    {order.direccion_envio && (
                      <div className="text-xs text-gray-500 mt-1">
                        🏠 {order.direccion_envio.ciudad}, {order.direccion_envio.pais}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoClass(order.estado)}`}>
                      {getEstadoTexto(order.estado)}
                    </span>
                    {order.estado_fulfillment !== 'completado' && (
                      <div className="text-xs text-gray-500 mt-1">
                        Envío: {getEstadoTexto(order.estado_fulfillment)}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoPagoClass(order.estado_pago)}`}>
                      {getEstadoPagoTexto(order.estado_pago)}
                    </span>
                    {order.fechas.pago && (
                      <div className="text-xs text-gray-500 mt-1">
                        Pagado: {new Date(order.fechas.pago).toLocaleDateString('es-ES')}
                      </div>
                    )}
                    {order.montos.total_reembolsado > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        Reembolsado: ${order.montos.total_reembolsado}
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      ${order.montos.total}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.total_items} items
                    </div>
                    {order.descuentos.length > 0 && (
                      <div className="text-xs text-green-600">
                        -${order.montos.descuento} desc
                      </div>
                    )}
                  </td>
                  
                  <td className="py-4 px-4 border-b">
                    <div className="space-y-1 max-w-xs">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={item.item_pedido_id} className="text-sm">
                          <span className="font-medium">{item.producto.nombre}</span>
                          {item.variante && (
                            <span className="text-gray-500"> - {item.variante.nombre}</span>
                          )}
                          <span className="text-gray-600"> x{item.cantidad}</span>
                          <div className="text-xs text-gray-500">
                            ${item.precio_unitario} c/u
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{order.items.length - 3} productos más...
                        </div>
                      )}
                    </div>
                    {order.metodo_envio && (
                      <div className="text-xs text-gray-500 mt-2">
                        🚚 {order.metodo_envio.nombre} (${order.metodo_envio.precio})
                      </div>
                    )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                    No se encontraron órdenes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Resumen estadístico */}
        {orders.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Total Ventas</div>
              <div className="text-2xl font-bold text-blue-700">
                ${orders.reduce((sum, order) => sum + order.montos.total, 0).toFixed(2)}
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
                {orders.reduce((sum, order) => sum + order.total_items, 0)}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}