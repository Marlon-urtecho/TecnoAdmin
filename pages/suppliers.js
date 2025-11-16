import Layout from "@/components/Layout";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/suppliers')
      .then(response => {
        setSuppliers(response.data);
      })
      .catch(error => {
        console.error('Error fetching suppliers:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusClass = (esta_activo) => {
    return esta_activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (esta_activo) => {
    return esta_activo ? 'Activo' : 'Inactivo';
  };

  // Función segura para obtener el conteo de productos
  const getProductCount = (supplier) => {
    return supplier?._count?.productos || 0;
  };

  // Función segura para obtener la fecha
  const getSafeDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('es-ES') : 'N/A';
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando proveedores...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
            <p className="text-gray-600 mt-1">
              Gestiona los proveedores de tu tienda
            </p>
          </div>
          <Link 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            href={'/suppliers/new'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo Proveedor
          </Link>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Proveedores</div>
            <div className="text-2xl font-bold text-blue-700">{suppliers.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Activos</div>
            <div className="text-2xl font-bold text-green-700">
              {suppliers.filter(s => s.esta_activo).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Total Productos</div>
            <div className="text-2xl font-bold text-purple-700">
              {suppliers.reduce((sum, s) => sum + getProductCount(s), 0)}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Proveedor
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Contacto
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Productos
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Fecha Registro
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {suppliers.length > 0 ? suppliers.map(supplier => (
                <tr key={supplier.proveedor_id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4 border-b">
                    <div className="font-medium text-gray-900">
                      {supplier.nombre || 'Sin nombre'}
                    </div>
                    {supplier.url_sitio_web && (
                      <div className="text-sm text-blue-600">
                        <a href={supplier.url_sitio_web} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {supplier.url_sitio_web}
                        </a>
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {supplier.persona_contacto && (
                        <div className="font-medium">📞 {supplier.persona_contacto}</div>
                      )}
                      {supplier.correo_electronico && (
                        <div className="text-gray-600">✉️ {supplier.correo_electronico}</div>
                      )}
                      {supplier.numero_telefono && (
                        <div className="text-gray-600">📱 {supplier.numero_telefono}</div>
                      )}
                      {!supplier.persona_contacto && !supplier.correo_electronico && !supplier.numero_telefono && (
                        <div className="text-gray-400 text-xs">Sin información de contacto</div>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm font-medium text-gray-900">
                      {getProductCount(supplier)} productos
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(supplier.esta_activo)}`}>
                      {getStatusText(supplier.esta_activo)}
                    </span>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {getSafeDate(supplier.fecha_creacion)}
                    </div>
                  </td>

                  <td className="py-4 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/suppliers/edit/' + supplier.proveedor_id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Editar
                      </Link>
                      <Link 
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/suppliers/delete/' + supplier.proveedor_id}
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
                    No se encontraron proveedores. 
                    <Link href="/suppliers/new" className="text-blue-600 hover:text-blue-800 ml-1">
                      Agrega tu primer proveedor
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