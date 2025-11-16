import Layout from "@/components/Layout";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function Users() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error HTTP! estado: ${response.status}`);
      }
      
      const data = await response.json();
      // Usar data.users si existe, sino data directamente
      setUsers(data.users || data);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Error al cargar usuarios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Función para obtener la clase del estado del usuario
  const getStatusClass = (esta_activo) => {
    return esta_activo 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  // Función para obtener el texto del estado
  const getStatusText = (esta_activo) => {
    return esta_activo ? 'Activo' : 'Inactivo';
  };

  // Función para obtener la clase del tipo de usuario
  const getTypeClass = (es_superusuario, es_personal) => {
    if (es_superusuario) return 'bg-purple-100 text-purple-800';
    if (es_personal) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Función para obtener el texto del tipo de usuario
  const getTypeText = (es_superusuario, es_personal) => {
    if (es_superusuario) return 'Superusuario';
    if (es_personal) return 'Personal';
    return 'Cliente';
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Función para eliminar usuario
  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userEmail}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
      }

      alert('Usuario eliminado correctamente');
      fetchUsers(); // Recargar la lista
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'Error al eliminar usuario');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando usuarios...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error al cargar usuarios</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
            <p className="text-gray-600 mt-1">
              Gestiona todos los usuarios del sistema
            </p>
          </div>
          <Link 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            href={'/users/new'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar Nuevo Usuario
          </Link>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Total Usuarios</div>
            <div className="text-2xl font-bold text-blue-700">{users.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-green-600 font-medium">Activos</div>
            <div className="text-2xl font-bold text-green-700">
              {users.filter(u => u.esta_activo).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Superusuarios</div>
            <div className="text-2xl font-bold text-purple-700">
              {users.filter(u => u.es_superusuario).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="text-sm text-orange-600 font-medium">Personal</div>
            <div className="text-2xl font-bold text-orange-700">
              {users.filter(u => u.es_personal).length}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Usuario
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Email
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Teléfono
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Tipo
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Estado
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Registro
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Pedidos
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length > 0 ? users.map(user => (
                <tr key={user.usuario_id} className="hover:bg-gray-50 transition-colors">
                  {/* Información del Usuario */}
                  <td className="py-4 px-4 border-b">
                    <div className="flex items-center space-x-3">
                      {user.perfil_usuario?.url_avatar ? (
                        <img 
                          src={user.perfil_usuario.url_avatar} 
                          alt={`${user.perfil_usuario.nombres} ${user.perfil_usuario.apellidos}`}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.perfil_usuario?.nombres} {user.perfil_usuario?.apellidos}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.usuario_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {user.correo_electronico}
                    </div>
                  </td>

                  {/* Teléfono */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {user.numero_telefono || 'No especificado'}
                    </div>
                  </td>

                  {/* Tipo de Usuario */}
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClass(user.es_superusuario, user.es_personal)}`}>
                      {getTypeText(user.es_superusuario, user.es_personal)}
                    </span>
                  </td>

                  {/* Estado */}
                  <td className="py-4 px-4 border-b">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(user.esta_activo)}`}>
                      {getStatusText(user.esta_activo)}
                    </span>
                  </td>

                  {/* Fecha de Registro */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {formatDate(user.fecha_registro)}
                    </div>
                  </td>

                  {/* Pedidos */}
                  <td className="py-4 px-4 border-b">
                    <div className="text-sm text-gray-900">
                      {user._count?.pedidos || 0} pedidos
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="py-4 px-4 border-b">
                    <div className="flex space-x-2">
                      <Link 
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        href={'/users/edit/' + user.usuario_id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Editar
                      </Link>
                      <button 
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                        onClick={() => handleDelete(user.usuario_id, user.correo_electronico)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                    No se encontraron usuarios. 
                    <Link href="/users/new" className="text-blue-600 hover:text-blue-800 ml-1">
                      Crea tu primer usuario
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