import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'

export default function UserEdit() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  
  const [formData, setFormData] = useState({
    correo_electronico: '',
    numero_telefono: '',
    password: '',
    confirmPassword: '',
    esta_activo: true,
    es_personal: false,
    es_superusuario: false,
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '',
    genero: '',
    url_avatar: '',
    suscrito_boletin: true,
    acepta_marketing: true
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const isEditing = id && id !== 'new'

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Verificar permisos de admin
    if (!session.user.isAdmin) {
      router.push('/unauthorized')
      return
    }

    if (isEditing) {
      fetchUser()
    }
  }, [session, status, id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users?id=${id}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar usuario')
      }

      const user = await response.json()
      
      setFormData({
        usuario_id: user.usuario_id,
        correo_electronico: user.correo_electronico,
        numero_telefono: user.numero_telefono || '',
        password: '',
        confirmPassword: '',
        esta_activo: user.esta_activo,
        es_personal: user.es_personal,
        es_superusuario: user.es_superusuario,
        nombres: user.perfil_usuario?.nombres || '',
        apellidos: user.perfil_usuario?.apellidos || '',
        fecha_nacimiento: user.perfil_usuario?.fecha_nacimiento ? 
          new Date(user.perfil_usuario.fecha_nacimiento).toISOString().split('T')[0] : '',
        genero: user.perfil_usuario?.genero || '',
        url_avatar: user.perfil_usuario?.url_avatar || '',
        suscrito_boletin: user.perfil_usuario?.suscrito_boletin ?? true,
        acepta_marketing: user.perfil_usuario?.acepta_marketing ?? true
      })
    } catch (error) {
      console.error('Error:', error)
      alert('Error al cargar usuario')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.correo_electronico) {
      newErrors.correo_electronico = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
      newErrors.correo_electronico = 'El email no es válido'
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = 'Los nombres son requeridos'
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son requeridos'
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'La contraseña es requerida para nuevos usuarios'
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const url = '/api/users'
      const method = isEditing ? 'PUT' : 'POST'

      // Preparar datos para enviar (excluir confirmPassword)
      const { confirmPassword, ...submitData } = formData

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      alert(isEditing ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente')
      router.push('/admin/users')
    } catch (error) {
      console.error('Error:', error)
      alert(error.message || 'Error al guardar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  if (status === 'loading' || loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-lg">Cargando...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title={isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin/users')}
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
            >
              ← Volver a la lista de usuarios
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-8">
            {/* Información Básica */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Información Básica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres *
                  </label>
                  <input
                    type="text"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nombres ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.nombres && (
                    <p className="text-red-500 text-sm mt-1">{errors.nombres}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.apellidos ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.apellidos && (
                    <p className="text-red-500 text-sm mt-1">{errors.apellidos}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Información de Contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="correo_electronico"
                    value={formData.correo_electronico}
                    onChange={handleChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.correo_electronico ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.correo_electronico && (
                    <p className="text-red-500 text-sm mt-1">{errors.correo_electronico}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="numero_telefono"
                    value={formData.numero_telefono}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contraseña */}
            {!isEditing && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Contraseña</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Contraseña *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Información Adicional */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Información Adicional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="masculino">Masculino</option>
                    <option value="femenino">Femenino</option>
                    <option value="otro">Otro</option>
                    <option value="prefiere_no_decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del Avatar
                </label>
                <input
                  type="url"
                  name="url_avatar"
                  value={formData.url_avatar}
                  onChange={handleChange}
                  placeholder="https://ejemplo.com/avatar.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Configuración de Cuenta */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Configuración de Cuenta</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Estado y Permisos</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="esta_activo"
                      checked={formData.esta_activo}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cuenta activa</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="es_personal"
                      checked={formData.es_personal}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Es personal</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="es_superusuario"
                      checked={formData.es_superusuario}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Es superusuario</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-medium text-gray-900">Preferencias</h3>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="suscrito_boletin"
                      checked={formData.suscrito_boletin}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Suscrito al boletín</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="acepta_marketing"
                      checked={formData.acepta_marketing}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Acepta marketing</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin/users')}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-150"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-150"
              >
                {saving ? 'Guardando...' : isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}