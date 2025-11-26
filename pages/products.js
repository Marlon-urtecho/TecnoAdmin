import Layout from "@/components/Layout";
import Link from "next/link";
import {useEffect, useState} from "react";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/products')
      .then(response => {
        setProducts(response.data);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Función para obtener la clase del estado del producto
  const getStatusClass = (esta_activo) => {
    return esta_activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Función para obtener el texto del estado
  const getStatusText = (esta_activo) => {
    return esta_activo ? 'Activo' : 'Inactivo';
  };

  // Función para obtener la clase del stock
  const getStockClass = (inventarios) => {
    const stock = inventarios?.[0]?.cantidad_disponible || 0;
    const alerta = inventarios?.[0]?.alerta_stock_bajo || false;
    
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (alerta) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Función para obtener el texto del stock
  const getStockText = (inventarios) => {
    const stock = inventarios?.[0]?.cantidad_disponible || 0;
    return stock === 0 ? 'Sin stock' : `${stock} disponibles`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando productos...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los productos de tu tienda
            </p>
          </div>
          <Link 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            href={'/products/new'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar Nuevo Producto
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Productos</div>
            <div className="text-2xl font-bold text-blue-700">{products.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Activos</div>
            <div className="text-2xl font-bold text-green-700">
              {products.filter(p => p.esta_activo).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Destacados</div>
            <div className="text-2xl font-bold text-purple-700">
              {products.filter(p => p.es_destacado).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Con Variantes</div>
            <div className="text-2xl font-bold text-orange-700">
              {products.filter(p => p._count.variantes > 0).length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Producto
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  SKU
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Categoría
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Precio
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Stock
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Variantes
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length > 0 ? products.map(product => (
                <tr key={product.producto_id} className="hover:bg-gray-50 transition-colors">
                  {/* Información del Producto */}
                  <td className="py-4 px-4 border-b">
                    <div className="flex items-center space-x-3">
                      {product.url_imagen_principal ? (
                        <img 
                          src={product.url_imagen_principal} 
                          alt={product.nombre}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.marca?.nombre || 'Sin marca'}
                        </div>
                        {product.es_destacado && (
                          <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mt-1">
                            Destacado
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-mono text-gray-900">
                      {product.sku}
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {product.categoria?.nombre || 'Sin categoría'}
                    </div>
                  </td>

                  {/* Precio */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      ${product.precio_base}
                    </div>
                    {product.precio_comparacion && (
                      <div className="text-xs text-gray-500 line-through">
                        ${product.precio_comparacion}
                      </div>
                    )}
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockClass(product.inventarios)}`}>
                      {getStockText(product.inventarios)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(product.esta_activo)}`}>
                      {getStatusText(product.esta_activo)}
                    </span>
                  </td>

                  {/* Variantes */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {product._count.variantes} variantes
                    </div>
                    <div className="text-xs text-gray-500">
                      {product._count.imagenes} imágenes
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/products/edit/' + product.producto_id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Editar
                      </Link>
                      <Link 
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/products/delete/' + product.producto_id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Eliminar
                      </Link>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                    No se encontraron productos. 
                    <Link href="/products/new" className="text-blue-600 hover:text-blue-800 ml-1">
                      Crea tu primer producto
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}