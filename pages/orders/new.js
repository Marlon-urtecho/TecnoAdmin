// pages/orders/new.js
import Layout from "@/components/Layout";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    correo_cliente: '',
    telefono_cliente: '',
    // Información de envío
    nombre_destinatario: '',
    linea_direccion1: '',
    linea_direccion2: '',
    ciudad: '',
    estado_provincia: '',
    codigo_postal: '',
    codigo_pais: 'US',
    // Productos
    productos: [{ producto_id: '', variante_id: '', cantidad: 1, precio_unitario: 0 }],
    // Información adicional
    metodo_envio_id: '',
    monto_descuento: 0, // Aseguramos que sea número
    instrucciones_especiales: ''
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Convertir a número si el campo es numérico
    let processedValue = value;
    if (name === 'monto_descuento' || name === 'cantidad' || name === 'precio_unitario') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData.productos];
    
    // Convertir a número si el campo es numérico
    let processedValue = value;
    if (field === 'cantidad' || field === 'precio_unitario') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    }
    
    updatedProductos[index][field] = processedValue;
    setFormData(prev => ({
      ...prev,
      productos: updatedProductos
    }));
  };

  const addProduct = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, { producto_id: '', variante_id: '', cantidad: 1, precio_unitario: 0 }]
    }));
  };

  const removeProduct = (index) => {
    if (formData.productos.length > 1) {
      const updatedProductos = formData.productos.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        productos: updatedProductos
      }));
    }
  };

  // Asegurar que monto_descuento sea número
  const getMontoDescuento = () => {
    return typeof formData.monto_descuento === 'number' ? formData.monto_descuento : 0;
  };

  const calculateTotal = () => {
    const subtotal = formData.productos.reduce((sum, producto) => {
      const cantidad = typeof producto.cantidad === 'number' ? producto.cantidad : 0;
      const precio = typeof producto.precio_unitario === 'number' ? producto.precio_unitario : 0;
      return sum + (cantidad * precio);
    }, 0);
    
    const descuento = getMontoDescuento();
    return Math.max(0, subtotal - descuento);
  };

  const getSubtotal = () => {
    return formData.productos.reduce((sum, producto) => {
      const cantidad = typeof producto.cantidad === 'number' ? producto.cantidad : 0;
      const precio = typeof producto.precio_unitario === 'number' ? producto.precio_unitario : 0;
      return sum + (cantidad * precio);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const subtotal = getSubtotal();
      const descuento = getMontoDescuento();
      const total = calculateTotal();

      const orderData = {
        ...formData,
        monto_descuento: descuento, // Aseguramos que sea número
        subtotal_items: subtotal,
        monto_total: total,
        estado: 'pendiente',
        estado_pago: 'pendiente'
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.data.success) {
        router.push(`/orders/${response.data.order.pedido_id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Crear Nueva Orden</h1>
          <p className="text-gray-600">Agregar una nueva orden manualmente</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Información del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="correo_cliente"
                  value={formData.correo_cliente}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  name="telefono_cliente"
                  value={formData.telefono_cliente}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Dirección de Envío */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Dirección de Envío</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Destinatario *
                </label>
                <input
                  type="text"
                  name="nombre_destinatario"
                  value={formData.nombre_destinatario}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección Línea 1 *
                </label>
                <input
                  type="text"
                  name="linea_direccion1"
                  value={formData.linea_direccion1}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección Línea 2
                </label>
                <input
                  type="text"
                  name="linea_direccion2"
                  value={formData.linea_direccion2}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado/Provincia
                  </label>
                  <input
                    type="text"
                    name="estado_provincia"
                    value={formData.estado_provincia}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    name="codigo_postal"
                    value={formData.codigo_postal}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País *
                </label>
                <select
                  name="codigo_pais"
                  value={formData.codigo_pais}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="US">Estados Unidos</option>
                  <option value="MX">México</option>
                  <option value="ES">España</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Productos</h2>
              <button
                type="button"
                onClick={addProduct}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                + Agregar Producto
              </button>
            </div>

            <div className="space-y-4">
              {formData.productos.map((producto, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">Producto {index + 1}</h3>
                    {formData.productos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Producto
                      </label>
                      <input
                        type="text"
                        value={producto.producto_id}
                        onChange={(e) => handleProductChange(index, 'producto_id', e.target.value)}
                        placeholder="UUID del producto"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Variante
                      </label>
                      <input
                        type="text"
                        value={producto.variante_id}
                        onChange={(e) => handleProductChange(index, 'variante_id', e.target.value)}
                        placeholder="UUID de variante (opcional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        value={producto.cantidad}
                        onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Unitario
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={producto.precio_unitario}
                        onChange={(e) => handleProductChange(index, 'precio_unitario', e.target.value)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen y Descuentos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descuento ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_descuento"
                  value={formData.monto_descuento}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ${getSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="text-red-600">
                    -${getMontoDescuento().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear Orden'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}