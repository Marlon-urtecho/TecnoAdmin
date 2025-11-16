import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/brands')
      .then(response => {
        setBrands(response.data);
      })
      .catch(error => {
        console.error('Error fetching brands:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusClass = (esta_activa) => {
    return esta_activa 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (esta_activa) => {
    return esta_activa ? 'Activa' : 'Inactiva';
  };

  // Función segura para obtener el conteo de productos
  const getProductCount = (brand) => {
    return brand?._count?.productos || 0;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando marcas...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Marcas</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las marcas de tu tienda
            </p>
          </div>
          <Link 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            href={'/brands/new'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nueva Marca
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Marcas</div>
            <div className="text-2xl font-bold text-blue-700">{brands.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Activas</div>
            <div className="text-2xl font-bold text-green-700">
              {brands.filter(b => b.esta_activa).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Total Productos</div>
            <div className="text-2xl font-bold text-purple-700">
              {brands.reduce((sum, b) => sum + getProductCount(b), 0)}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Ordenadas</div>
            <div className="text-2xl font-bold text-orange-700">
              {brands.filter(b => b.orden > 0).length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Marca
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Descripción
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Productos
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Orden
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.length > 0 ? brands.map(brand => (
                <tr key={brand.marca_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-b">
                    <div className="flex items-center space-x-3">
                      {brand.url_logo ? (
                        <img 
                          src={brand.url_logo} 
                          alt={brand.nombre}
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
                          {brand.nombre || 'Sin nombre'}
                        </div>
                        {brand.url_sitio_web && (
                          <div className="text-sm text-blue-600">
                            <a 
                              href={brand.url_sitio_web.startsWith('http') ? brand.url_sitio_web : `https://${brand.url_sitio_web}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:underline"
                            >
                              Sitio web
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {brand.descripcion ? (
                        <span className="line-clamp-2">{brand.descripcion}</span>
                      ) : (
                        <span className="text-gray-400">Sin descripción</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      {getProductCount(brand)} productos
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-mono text-gray-900">
                      {brand.orden}
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(brand.esta_activa)}`}>
                      {getStatusText(brand.esta_activa)}
                    </span>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/brands/edit/' + brand.marca_id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Editar
                      </Link>
                      <Link 
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${
                          getProductCount(brand) > 0 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-red-100 hover:bg-red-200 text-red-700'
                        }`}
                        href={getProductCount(brand) > 0 ? '#' : '/brands/delete/' + brand.marca_id}
                        onClick={(e) => {
                          if (getProductCount(brand) > 0) {
                            e.preventDefault();
                            alert('No se puede eliminar una marca con productos asociados');
                          }
                        }}
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
                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                    No se encontraron marcas. 
                    <Link href="/brands/new" className="text-blue-600 hover:text-blue-800 ml-1">
                      Agrega tu primera marca
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