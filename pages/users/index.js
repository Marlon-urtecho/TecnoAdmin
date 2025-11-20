import Layout from '@/components/Layout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

export default function UsersAdmin() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Verificar si es admin - CORREGIDO: usar la propiedad correcta
    if (!session.user.isAdmin && !session.user.es_superusuario) {
      router.push('/unauthorized')
      return
    }
    
    fetchUsers()
  }, [session, status, pagination.page, search, statusFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      // Construir parámetros de consulta
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      // Nota: Tu API actual probablemente no soporta paginación, 
      // así que no enviamos page/limit por ahora
      // params.append('page', pagination.page)
      // params.append('limit', pagination.limit)

      const queryString = params.toString()
      const url = queryString ? `/api/users?${queryString}` : '/api/users'

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Error al cargar usuarios')
      }

      const data = await response.json()
      
      // ADAPTACIÓN: Tu API probablemente devuelve { users: [], total: number }
      // en lugar de { users: [], pagination: {} }
      if (data.users) {
        setUsers(data.users)
        
        // Calcular paginación basada en los datos recibidos
        const total = data.total || data.users.length
        const totalPages = Math.ceil(total / pagination.limit)
        
        setPagination(prev => ({
          ...prev,
          total: total,
          totalPages: totalPages
        }))
      } else {
        // Si la API devuelve un array directamente
        setUsers(data)
        setPagination(prev => ({
          ...prev,
          total: data.length,
          totalPages: Math.ceil(data.length / prev.limit)
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener usuarios paginados del array completo
  const getPaginatedUsers = () => {
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    return users.slice(startIndex, endIndex)
  }

  const handleDelete = async (userId, userEmail) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al usuario ${userEmail}?`)) {
      return
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      alert('Usuario eliminado correctamente')
      fetchUsers() // Recargar la lista
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Error al eliminar usuario')
    }
  }

  const handleStatusChange = async (userId, currentStatus) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuario_id: userId,
          esta_activo: !currentStatus
        })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado')
      }

      alert(`Usuario ${!currentStatus ? 'activado' : 'desactivado'} correctamente`)
      fetchUsers() // Recargar la lista
    } catch (error) {
      console.error('Error:', error)
      alert('Error al actualizar estado del usuario')
    }
  }

  const getProviderIcons = (providers) => {
    if (!providers || providers.length === 0) return null
    
    return providers.map((account, index) => (
      <span
        key={index}
        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 mr-1"
        title={`Login con ${account.proveedor.nombre}`}
      >
        {account.proveedor.nombre}
      </span>
    ))
  }

  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    )
  }

  // Obtener usuarios para la página actual
  const displayedUsers = getPaginatedUsers()

  return (
    <Layout title="Admin - Gestión de Usuarios">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600 mt-2">
              Administra los usuarios del sistema
            </p>
          </div>
          <button
            onClick={() => router.push('/users/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Nuevo Usuario
          </button>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar usuarios
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPagination(prev => ({ ...prev, page: 1 }))
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los usuarios</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="staff">Personal</option>
                <option value="superuser">Superusuarios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Usuarios</div>
            <div className="text-2xl font-bold">{pagination.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Página Actual</div>
            <div className="text-2xl font-bold">{pagination.page}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Por Página</div>
            <div className="text-2xl font-bold">{pagination.limit}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Páginas</div>
            <div className="text-2xl font-bold">{pagination.totalPages}</div>
          </div>
        </div>

        {/* Tabla de usuarios */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-600">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Cargando usuarios...
            </div>
          ) : displayedUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No se encontraron usuarios
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estadísticas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Último Acceso
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedUsers.map((user) => (
                      <tr key={user.usuario_id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.perfil_usuario?.url_avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.perfil_usuario.url_avatar}
                                alt="Avatar"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-600 text-sm font-medium">
                                  {user.perfil_usuario?.nombres?.[0] || user.correo_electronico[0].toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.perfil_usuario ? 
                                  `${user.perfil_usuario.nombres} ${user.perfil_usuario.apellidos}` : 
                                  'Sin perfil'
                                }
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                {user.correo_electronico}
                                {user.correo_verificado && (
                                  <span className="ml-1 text-green-600" title="Email verificado">✓</span>
                                )}
                              </div>
                              {user.perfil_usuario?.fecha_nacimiento && (
                                <div className="text-xs text-gray-400">
                                  {new Date(user.perfil_usuario.fecha_nacimiento).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {getProviderIcons(user.cuentas_oauth)}
                            {(!user.cuentas_oauth || user.cuentas_oauth.length === 0) && (
                              <span className="text-xs text-gray-500">Email/Password</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.esta_activo
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {user.esta_activo ? 'Activo' : 'Inactivo'}
                            </span>
                            <div className="flex space-x-1">
                              {user.es_superusuario && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  Super
                                </span>
                              )}
                              {user.es_personal && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  Staff
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 space-y-1">
                            <div>Pedidos: {user._count?.pedidos || 0}</div>
                            <div>Carritos: {user._count?.carritos || 0}</div>
                            <div>Sesiones: {user._count?.sesiones_usuario || 0}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.ultimo_acceso ? (
                            <div>
                              <div>{new Date(user.ultimo_acceso).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">
                                {new Date(user.ultimo_acceso).toLocaleTimeString()}
                              </div>
                            </div>
                          ) : (
                            'Nunca'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => router.push(`/users/${user.usuario_id}`)}
                            className="text-blue-600 hover:text-blue-900 transition duration-150"
                            title="Editar usuario"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.usuario_id, user.esta_activo)}
                            className={`${
                              user.esta_activo
                                ? 'text-orange-600 hover:text-orange-900'
                                : 'text-green-600 hover:text-green-900'
                            } transition duration-150`}
                            title={user.esta_activo ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.esta_activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDelete(user.usuario_id, user.correo_electronico)}
                            className="text-red-600 hover:text-red-900 transition duration-150"
                            title="Eliminar usuario"
                            disabled={session.user.id === user.usuario_id}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                      {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                      {pagination.total} usuarios
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                        disabled={pagination.page === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                      >
                        Anterior
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-700">
                        Página {pagination.page} de {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={pagination.page === pagination.totalPages}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}