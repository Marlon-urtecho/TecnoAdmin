import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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

const formatFecha = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatFechaCorta = (fecha) => {
  if (!fecha) return 'N/A';
  return new Date(fecha).toLocaleDateString('es-ES');
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setError(null);
      const response = await axios.get(`/api/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('No se pudo cargar la orden');
    } finally {
      setLoading(false);
    }
  };

  const handleApiCall = async (apiCall, successMessage) => {
    setUpdating(true);
    try {
      const response = await apiCall();
      
      if (response.data.order) {
        setOrder(response.data.order);
      } else if (response.data.pedido_id) {
        setOrder(response.data);
      }
      
      if (successMessage) {
        alert(successMessage);
      }
      
      await loadOrder();
      
    } catch (error) {
      console.error('Error en API call:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Error en la operación';
      alert(`Error: ${errorMessage}`);
      await loadOrder();
    } finally {
      setUpdating(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    await handleApiCall(
      () => axios.put(`/api/orders/${id}`, { 
        estado: newStatus 
      }),
      'Estado actualizado exitosamente'
    );
  };

  const updateTrackingNumber = async (trackingNumber) => {
    if (!trackingNumber.trim()) return;
    await handleApiCall(
      () => axios.put(`/api/orders/${id}`, { 
        numero_seguimiento: trackingNumber 
      }),
      'Número de seguimiento actualizado'
    );
  };

  const confirmarVenta = async () => {
    await handleApiCall(
      () => axios.post(`/api/orders/${id}`, { 
        action: 'confirmar_venta' 
      }),
      'Venta confirmada exitosamente'
    );
  };

  const marcarComoPagado = async () => {
    await handleApiCall(
      () => axios.post(`/api/orders/${id}`, { 
        action: 'marcar_como_pagado' 
      }),
      'Orden marcada como pagada'
    );
  };

  const marcarComoEnviado = async () => {
    await handleApiCall(
      () => axios.post(`/api/orders/${id}`, { 
        action: 'marcar_como_enviado' 
      }),
      'Orden marcada como enviada'
    );
  };

  const marcarComoEntregado = async () => {
    await handleApiCall(
      () => axios.post(`/api/orders/${id}`, { 
        action: 'marcar_como_entregado' 
      }),
      'Orden marcada como entregada'
    );
  };

  const cancelarOrden = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta orden? Esta acción no se puede deshacer.')) {
      return;
    }
    
    await handleApiCall(
      () => axios.post(`/api/orders/${id}`, { 
        action: 'cancelar_orden' 
      }),
      'Orden cancelada exitosamente'
    );
  };

  // Función para imprimir factura
  const imprimirFactura = () => {
    const printContent = document.getElementById('factura-print');
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando orden...</span>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-gray-800">
            {error || 'Orden no encontrada'}
          </h1>
          <p className="text-gray-600 mt-2">ID: {id}</p>
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Volver a órdenes
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Header con navegación */}
        <div className="mb-6">
          <Link href="/orders" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a todas las órdenes
          </Link>
        </div>

        {/* Header de la orden */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Orden #{order.numero_pedido}
              </h1>
              <p className="text-gray-600">
                Creada el {formatFecha(order.fecha_creacion)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800 mb-2">
                ${order.monto_total?.toFixed(2)}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoClass(order.estado)}`}>
                  {getEstadoTexto(order.estado)}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getEstadoPagoClass(order.estado_pago)}`}>
                  {getEstadoPagoTexto(order.estado_pago)}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={order.estado}
                onChange={(e) => updateOrderStatus(e.target.value)}
                disabled={updating}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmado">Confirmado</option>
                <option value="procesando">Procesando</option>
                <option value="enviado">Enviado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Número de seguimiento"
                  defaultValue={order.numero_seguimiento || ''}
                  onBlur={(e) => updateTrackingNumber(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">Enter para guardar</span>
              </div>

              <button
                onClick={imprimirFactura}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                🖨️ Imprimir Factura
              </button>
            </div>

            {/* Botones de acción específicos */}
            <div className="flex flex-wrap gap-2">
              {order.estado === 'pendiente' && (
                <button
                  onClick={confirmarVenta}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Confirmando...' : 'Confirmar Venta'}
                </button>
              )}
              
              {order.estado_pago === 'pendiente' && order.estado !== 'cancelado' && (
                <button
                  onClick={marcarComoPagado}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? 'Marcando...' : 'Marcar como Pagado'}
                </button>
              )}
              
              {(order.estado === 'confirmado' || order.estado === 'procesando') && (
                <button
                  onClick={marcarComoEnviado}
                  disabled={updating}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 disabled:opacity-50"
                >
                  {updating ? 'Enviando...' : 'Marcar como Enviado'}
                </button>
              )}
              
              {order.estado === 'enviado' && (
                <button
                  onClick={marcarComoEntregado}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {updating ? 'Entregando...' : 'Marcar como Entregado'}
                </button>
              )}
              
              {!['entregado', 'cancelado', 'reembolsado'].includes(order.estado) && (
                <button
                  onClick={cancelarOrden}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {updating ? 'Cancelando...' : 'Cancelar Orden'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido para impresión (oculto en pantalla normal) */}
        <div id="factura-print" className="hidden">
          <div className="p-8 bg-white">
            {/* Encabezado de factura */}
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold">FACTURA</h1>
                  <p className="text-lg">Orden #{order.numero_pedido}</p>
                  <p className="text-gray-600">Fecha: {formatFechaCorta(order.fecha_creacion)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${order.monto_total?.toFixed(2)}</div>
                  <p className="text-sm">
                    Estado: {getEstadoTexto(order.estado)} | Pago: {getEstadoPagoTexto(order.estado_pago)}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h2 className="text-lg font-bold mb-2">INFORMACIÓN DEL CLIENTE</h2>
                <p><strong>Email:</strong> {order.correo_cliente}</p>
                <p><strong>Teléfono:</strong> {order.telefono_cliente || 'No proporcionado'}</p>
                {order.usuario?.perfil_usuario && (
                  <p><strong>Nombre:</strong> {order.usuario.perfil_usuario.nombres} {order.usuario.perfil_usuario.apellidos}</p>
                )}
              </div>
              
              {order.direccion_envio && (
                <div>
                  <h2 className="text-lg font-bold mb-2">DIRECCIÓN DE ENVÍO</h2>
                  <p>{order.direccion_envio.nombre_destinatario}</p>
                  <p>{order.direccion_envio.linea_direccion1}</p>
                  {order.direccion_envio.linea_direccion2 && <p>{order.direccion_envio.linea_direccion2}</p>}
                  <p>{order.direccion_envio.ciudad}, {order.direccion_envio.estado_provincia}</p>
                  <p>{order.direccion_envio.codigo_postal}, {order.direccion_envio.codigo_pais}</p>
                </div>
              )}
            </div>

            {/* Productos */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-4">PRODUCTOS</h2>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Producto</th>
                    <th className="border border-gray-300 p-2 text-left">SKU</th>
                    <th className="border border-gray-300 p-2 text-center">Cantidad</th>
                    <th className="border border-gray-300 p-2 text-right">Precio Unit.</th>
                    <th className="border border-gray-300 p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, index) => (
                    <tr key={item.item_pedido_id} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-300 p-2">{item.nombre_producto}</td>
                      <td className="border border-gray-300 p-2">{item.sku_producto}</td>
                      <td className="border border-gray-300 p-2 text-center">{item.cantidad}</td>
                      <td className="border border-gray-300 p-2 text-right">${item.precio_unitario?.toFixed(2)}</td>
                      <td className="border border-gray-300 p-2 text-right">${item.precio_total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen de pagos */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold mb-2">RESUMEN DE PAGO</h2>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${order.subtotal_items?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>${order.costo_envio?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos:</span>
                    <span>${order.monto_impuestos?.toFixed(2)}</span>
                  </div>
                  {order.monto_descuento > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Descuento:</span>
                      <span>-${order.monto_descuento?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-gray-300 pt-1 font-bold">
                    <span>TOTAL:</span>
                    <span>${order.monto_total?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {order.pagos && order.pagos.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold mb-2">PAGOS REGISTRADOS</h2>
                  {order.pagos.map((pago) => (
                    <div key={pago.pago_id} className="mb-2">
                      <div className="flex justify-between">
                        <span>${pago.monto?.toFixed(2)}</span>
                        <span>{getEstadoPagoTexto(pago.estado)}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatFechaCorta(pago.fecha_creacion)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información adicional */}
            <div className="mt-8 pt-4 border-t border-gray-300 text-center text-sm text-gray-600">
              <p>Gracias por su compra</p>
              <p>Para consultas sobre su pedido, contacte a servicio al cliente</p>
              <p>Factura generada el {formatFecha(new Date())}</p>
            </div>
          </div>
        </div>

        {/* Grid de información (vista normal) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Información del cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700">Email:</strong>
                <p className="text-gray-900">{order.correo_cliente}</p>
              </div>
              <div>
                <strong className="text-gray-700">Teléfono:</strong>
                <p className="text-gray-900">{order.telefono_cliente || 'No proporcionado'}</p>
              </div>
              {order.usuario && (
                <div>
                  <strong className="text-gray-700">Usuario registrado:</strong>
                  <p className="text-green-600 font-medium">Sí</p>
                  {order.usuario.perfil_usuario && (
                    <p className="text-sm text-gray-600">
                      {order.usuario.perfil_usuario.nombres} {order.usuario.perfil_usuario.apellidos}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Dirección de envío */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Dirección de Envío</h2>
            {order.direccion_envio ? (
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-700">Nombre:</strong>
                  <p className="text-gray-900">{order.direccion_envio.nombre_destinatario}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Dirección:</strong>
                  <p className="text-gray-900">{order.direccion_envio.linea_direccion1}</p>
                  {order.direccion_envio.linea_direccion2 && (
                    <p className="text-gray-900">{order.direccion_envio.linea_direccion2}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <strong className="text-gray-700">Ciudad:</strong>
                    <p className="text-gray-900">{order.direccion_envio.ciudad}</p>
                  </div>
                  <div>
                    <strong className="text-gray-700">Código Postal:</strong>
                    <p className="text-gray-900">{order.direccion_envio.codigo_postal}</p>
                  </div>
                </div>
                <div>
                  <strong className="text-gray-700">País:</strong>
                  <p className="text-gray-900">{order.direccion_envio.codigo_pais}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay dirección de envío registrada</p>
            )}
          </div>

          {/* Información de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Información de Pago</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong className="text-gray-700">Subtotal:</strong>
                  <p className="text-gray-900">${order.subtotal_items?.toFixed(2)}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Envío:</strong>
                  <p className="text-gray-900">${order.costo_envio?.toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <strong className="text-gray-700">Impuestos:</strong>
                  <p className="text-gray-900">${order.monto_impuestos?.toFixed(2)}</p>
                </div>
                <div>
                  <strong className="text-gray-700">Descuento:</strong>
                  <p className="text-red-600">-${order.monto_descuento?.toFixed(2)}</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <strong className="text-gray-700 text-lg">Total:</strong>
                <p className="text-gray-900 text-xl font-bold">${order.monto_total?.toFixed(2)}</p>
              </div>
              {order.pagos && order.pagos.length > 0 && (
                <div className="border-t pt-3">
                  <strong className="text-gray-700">Pagos registrados:</strong>
                  {order.pagos.map((pago) => (
                    <div key={pago.pago_id} className="text-sm mt-1">
                      <span className={`px-2 py-1 rounded ${getEstadoPagoClass(pago.estado)}`}>
                        ${pago.monto?.toFixed(2)} - {getEstadoPagoTexto(pago.estado)}
                      </span>
                      {pago.fecha_creacion && (
                        <span className="text-xs text-gray-500 ml-2">
                          {formatFecha(pago.fecha_creacion)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Productos ({order.items?.length || 0})</h2>
            <div className="text-sm text-gray-500">
              Total items: {order.items?.reduce((sum, item) => sum + (item.cantidad || 0), 0) || 0}
            </div>
          </div>
          
          {order.items && order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">SKU</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Cantidad</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Precio Unitario</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.item_pedido_id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{item.nombre_producto}</div>
                          {item.variante && (
                            <div className="text-sm text-gray-500">
                              Variante: {item.variante.nombre_variante}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">{item.sku_producto}</td>
                      <td className="py-4 px-4 text-gray-600">{item.cantidad}</td>
                      <td className="py-4 px-4 text-gray-600">${item.precio_unitario?.toFixed(2)}</td>
                      <td className="py-4 px-4 font-medium text-gray-900">${item.precio_total?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="py-3 px-4 text-right font-medium text-gray-700">
                      Total:
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">
                      ${order.monto_total?.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No hay productos en esta orden</p>
          )}
        </div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Método de envío */}
          {order.metodo_envio && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Método de Envío</h3>
              <p className="text-gray-700">{order.metodo_envio.nombre}</p>
              <p className="text-gray-600 text-sm">Costo: ${order.metodo_envio.precio?.toFixed(2)}</p>
              {order.metodo_envio.dias_estimados_min && order.metodo_envio.dias_estimados_max && (
                <p className="text-gray-600 text-sm">
                  Tiempo estimado: {order.metodo_envio.dias_estimados_min}-{order.metodo_envio.dias_estimados_max} días
                </p>
              )}
            </div>
          )}

          {order.numero_seguimiento && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">Seguimiento</h3>
              <p className="text-blue-600 font-mono">{order.numero_seguimiento}</p>
              <p className="text-gray-600 text-sm">Número de seguimiento</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}