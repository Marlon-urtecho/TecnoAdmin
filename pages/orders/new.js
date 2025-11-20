import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    categoria: "",
    marca: "",
    conStock: true
  });

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
    codigo_pais: 'MX',
    // Productos
    productos: [],
    // Información adicional
    metodo_envio_id: '',
    monto_descuento: 0,
    instrucciones_especiales: ''
  });

  useEffect(() => {
    cargarProductosYCategorias();
  }, []);

  useEffect(() => {
    filtrarProductos();
  }, [filtros, productos]);

  const cargarProductosYCategorias = async () => {
    try {
      const [productosRes, categoriasRes, marcasRes] = await Promise.all([
        axios.get('/api/productos/buscar?disponibles=true&incluirVariantes=true&limite=100'),
        axios.get('/api/categories'),
        axios.get('/api/brands')
      ]);

      setProductos(productosRes.data);
      setCategorias(categoriasRes.data);
      setMarcas(marcasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const filtrarProductos = () => {
    let filtrados = [...productos];

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      filtrados = filtrados.filter(producto => 
        producto.nombre.toLowerCase().includes(busqueda) ||
        producto.sku.toLowerCase().includes(busqueda) ||
        producto.descripcion?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      filtrados = filtrados.filter(producto => 
        producto.categoria_id === filtros.categoria
      );
    }

    // Filtro por marca
    if (filtros.marca) {
      filtrados = filtrados.filter(producto => 
        producto.marca_id === filtros.marca
      );
    }

    // Filtro por stock
    if (filtros.conStock) {
      filtrados = filtrados.filter(producto => {
        const stockDisponible = producto.inventarios?.[0]?.cantidad_disponible || 0;
        return stockDisponible > 0 || !producto.controlar_inventario;
      });
    }

    setProductosFiltrados(filtrados);
  };

  const agregarProductoAlCarrito = (producto) => {
    const variante = producto.variantes?.[0];
    const precio = variante ? producto.precio_base + (variante.ajuste_precio || 0) : producto.precio_base;
    const stockDisponible = producto.inventarios?.[0]?.cantidad_disponible || 0;
    
    const nuevoProducto = {
      producto_id: producto.producto_id,
      variante_id: variante?.variante_id || null,
      nombre_producto: producto.nombre,
      sku_producto: variante?.sku || producto.sku,
      cantidad: 1,
      precio_unitario: precio,
      stock_disponible: stockDisponible,
      controlar_inventario: producto.controlar_inventario
    };

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, nuevoProducto]
    }));

    setMostrarBusqueda(false);
    setFiltros({ busqueda: "", categoria: "", marca: "", conStock: true });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'monto_descuento') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updatedProductos = [...formData.productos];
    
    let processedValue = value;
    if (field === 'cantidad' || field === 'precio_unitario') {
      processedValue = value === '' ? 0 : parseFloat(value) || 0;
    }
    
    // Validar stock si se está cambiando la cantidad
    if (field === 'cantidad' && updatedProductos[index].controlar_inventario) {
      const stockDisponible = updatedProductos[index].stock_disponible;
      if (processedValue > stockDisponible) {
        alert(`No hay suficiente stock. Stock disponible: ${stockDisponible}`);
        return;
      }
    }
    
    updatedProductos[index][field] = processedValue;
    setFormData(prev => ({
      ...prev,
      productos: updatedProductos
    }));
  };

  const removeProduct = (index) => {
    const updatedProductos = formData.productos.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      productos: updatedProductos
    }));
  };

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
    
    if (formData.productos.length === 0) {
      alert('Agrega al menos un producto a la orden');
      return;
    }

    if (!formData.correo_cliente) {
      alert('El email del cliente es obligatorio');
      return;
    }

    setLoading(true);

    try {
      const subtotal = getSubtotal();
      const descuento = getMontoDescuento();
      const total = calculateTotal();

      const orderData = {
        ...formData,
        monto_descuento: descuento,
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
      <div className="max-w-6xl mx-auto">
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
                  <option value="MX">México</option>
                  <option value="US">Estados Unidos</option>
                  <option value="ES">España</option>
                  <option value="AR">Argentina</option>
                  <option value="CO">Colombia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Productos - Nueva interfaz de búsqueda */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Productos</h2>
              <button
                type="button"
                onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                {mostrarBusqueda ? 'Ocultar Búsqueda' : '+ Buscar Productos'}
              </button>
            </div>

            {/* Panel de búsqueda de productos */}
            {mostrarBusqueda && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-3">Buscar Productos</h3>
                
                {/* Filtros de búsqueda */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Buscar
                    </label>
                    <input
                      type="text"
                      value={filtros.busqueda}
                      onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                      placeholder="Nombre, SKU, descripción..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={filtros.categoria}
                      onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map(categoria => (
                        <option key={categoria.categoria_id} value={categoria.categoria_id}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marca
                    </label>
                    <select
                      value={filtros.marca}
                      onChange={(e) => setFiltros({...filtros, marca: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todas las marcas</option>
                      {marcas.map(marca => (
                        <option key={marca.marca_id} value={marca.marca_id}>
                          {marca.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filtros.conStock}
                        onChange={(e) => setFiltros({...filtros, conStock: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Solo con stock</span>
                    </label>
                  </div>
                </div>

                {/* Lista de productos filtrados */}
                <div className="max-h-60 overflow-y-auto">
                  {productosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {productosFiltrados.map(producto => {
                        const stockDisponible = producto.inventarios?.[0]?.cantidad_disponible || 0;
                        const tieneStock = stockDisponible > 0 || !producto.controlar_inventario;
                        
                        return (
                          <div
                            key={producto.producto_id}
                            className="flex justify-between items-center p-3 border border-gray-200 rounded hover:bg-gray-100"
                          >
                            <div className="flex-1">
                              <div className="font-medium">{producto.nombre}</div>
                              <div className="text-sm text-gray-600">
                                SKU: {producto.sku} | 
                                Precio: ${producto.precio_base} | 
                                Stock: {stockDisponible}
                              </div>
                              <div className="text-xs text-gray-500">
                                {producto.categoria?.nombre} / {producto.marca?.nombre}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => agregarProductoAlCarrito(producto)}
                              className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!tieneStock}
                            >
                              {tieneStock ? 'Agregar' : 'Sin Stock'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No se encontraron productos con los filtros aplicados
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lista de productos agregados */}
            <div className="space-y-4">
              {formData.productos.length > 0 ? (
                formData.productos.map((producto, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium">{producto.nombre_producto}</h3>
                        <p className="text-sm text-gray-600">SKU: {producto.sku_producto}</p>
                        {producto.controlar_inventario && (
                          <p className="text-xs text-gray-500">
                            Stock disponible: {producto.stock_disponible}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          value={producto.cantidad}
                          onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                          min="1"
                          max={producto.controlar_inventario ? producto.stock_disponible : undefined}
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
                      <div className="flex items-end">
                        <div className="w-full">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtotal
                          </label>
                          <p className="font-medium">
                            ${(producto.cantidad * producto.precio_unitario).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  No hay productos agregados. Haz clic en "Buscar Productos" para agregar productos.
                </div>
              )}
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
              disabled={loading || formData.productos.length === 0}
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