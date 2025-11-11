import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function CustomPrismaAdapter() {
  return {
    async createUser(profile) {
      console.log('Custom adapter: createUser', profile.email)
      
      try {
        const usuario = await prisma.usuario.create({
          data: {
            correo_electronico: profile.email,
            correo_verificado: new Date(),
            esta_activo: true,
            fecha_registro: new Date(),
            perfil_usuario: {
              create: {
                nombres: profile.name?.split(' ')[0] || 'Usuario',
                apellidos: profile.name?.split(' ').slice(1).join(' ') || 'Google',
                url_avatar: profile.image,
              }
            }
          }
        })
        
        console.log(' Usuario creado:', usuario.usuario_id)
        return {
          id: usuario.usuario_id,
          email: usuario.correo_electronico,
          emailVerified: usuario.correo_verificado,
          name: profile.name,
          image: profile.image,
        }
      } catch (error) {
        console.error('❌ Error en createUser:', error)
        throw error
      }
    },

    async getUser(id) {
      console.log(' Custom adapter: getUser', id)
      
      try {
        const usuario = await prisma.usuario.findUnique({
          where: { usuario_id: id },
          include: { perfil_usuario: true }
        })
        
        if (!usuario) {
          console.log(' Usuario no encontrado')
          return null
        }
        
        return {
          id: usuario.usuario_id,
          email: usuario.correo_electronico,
          emailVerified: usuario.correo_verificado,
          name: usuario.perfil_usuario?.nombres + ' ' + usuario.perfil_usuario?.apellidos,
          image: usuario.perfil_usuario?.url_avatar,
        }
      } catch (error) {
        console.error(' Error en getUser:', error)
        return null
      }
    },

    async getUserByEmail(email) {
  console.log('Custom adapter: getUserByEmail', email)
  
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { correo_electronico: email },
      include: { 
        perfil_usuario: true,
        cuentas_oauth: true  // ← AGREGAR ESTO
      }
    })
    
    if (!usuario) {
      console.log('❌ Usuario no encontrado por email')
      return null
    }
    
    console.log(' Usuario encontrado por email:', usuario.usuario_id)
    console.log(' Cuentas OAuth del usuario:', usuario.cuentas_oauth.length)
    
    return {
      id: usuario.usuario_id,
      email: usuario.correo_electronico,
      emailVerified: usuario.correo_verificado,
      name: usuario.perfil_usuario?.nombres + ' ' + usuario.perfil_usuario?.apellidos,
      image: usuario.perfil_usuario?.url_avatar,
    }
  } catch (error) {
    console.error('❌ Error en getUserByEmail:', error)
    return null
  }
},

    async getUserByAccount({ providerAccountId, provider }) {
      console.log(' Custom adapter: getUserByAccount', { providerAccountId, provider })
      
      try {
        const cuenta = await prisma.cuentaOAuth.findFirst({
          where: {
            id_usuario_proveedor: providerAccountId,
            proveedor: { nombre: provider }
          },
          include: {
            usuario: { include: { perfil_usuario: true } }
          }
        })
        
        if (!cuenta) {
          console.log('❌ Cuenta OAuth no encontrada')
          return null
        }
        
        console.log(' Cuenta OAuth encontrada para usuario:', cuenta.usuario.usuario_id)
        return {
          id: cuenta.usuario.usuario_id,
          email: cuenta.usuario.correo_electronico,
          emailVerified: cuenta.usuario.correo_verificado,
          name: cuenta.usuario.perfil_usuario?.nombres + ' ' + cuenta.usuario.perfil_usuario?.apellidos,
          image: cuenta.usuario.perfil_usuario?.url_avatar,
        }
      } catch (error) {
        console.error('❌ Error en getUserByAccount:', error)
        return null
      }
    },

    async linkAccount(account) {
      console.log(' Custom adapter: linkAccount', {
        userId: account.userId,
        provider: account.provider,
        providerAccountId: account.providerAccountId
      })
      
      try {
        // Buscar proveedor OAuth
        const proveedor = await prisma.proveedorOAuth.findFirst({
          where: { nombre: account.provider }
        })
        
        console.log(' Proveedor encontrado:', proveedor)
        
        if (!proveedor) {
          console.log(' Proveedor OAuth no encontrado, creando uno...')
          // Crear proveedor automáticamente si no existe
          const nuevoProveedor = await prisma.proveedorOAuth.create({
            data: {
              nombre: account.provider,
              cliente_id: 'auto-created',
              secreto_cliente: 'auto-created',
              esta_activo: true,
              configuracion: {},
              fecha_creacion: new Date()
            }
          })
          
          await prisma.cuentaOAuth.create({
            data: {
              usuario_id: account.userId,
              proveedor_id: nuevoProveedor.proveedor_id,
              id_usuario_proveedor: account.providerAccountId,
              token_acceso: account.access_token,
              token_actualizacion: account.refresh_token,
              token_expiracion: account.expires_at ? new Date(account.expires_at * 1000) : null,
              alcance: account.scope,
              fecha_creacion: new Date(),
              fecha_actualizacion: new Date()
            }
          })
        } else {
          // Crear cuenta OAuth
          await prisma.cuentaOAuth.create({
            data: {
              usuario_id: account.userId,
              proveedor_id: proveedor.proveedor_id,
              id_usuario_proveedor: account.providerAccountId,
              token_acceso: account.access_token,
              token_actualizacion: account.refresh_token,
              token_expiracion: account.expires_at ? new Date(account.expires_at * 1000) : null,
              alcance: account.scope,
              fecha_creacion: new Date(),
              fecha_actualizacion: new Date()
            }
          })
        }
        
        console.log(' Cuenta OAuth creada exitosamente')
        return account
        
      } catch (error) {
        console.error('Error en linkAccount:', error)
        throw error
      }
    },

    async createSession({ sessionToken, userId, expires }) {
      console.log(' Custom adapter: createSession', { sessionToken, userId })
      
      try {
        await prisma.sesionUsuario.create({
          data: {
            usuario_id: userId,
            token_sesion: sessionToken,
            fecha_expiracion: expires,
            fecha_creacion: new Date()
          }
        })
        
        console.log(' Sesión creada exitosamente')
        return { sessionToken, userId, expires }
      } catch (error) {
        console.error('❌ Error en createSession:', error)
        throw error
      }
    },

    async getSessionAndUser(sessionToken) {
      console.log(' Custom adapter: getSessionAndUser', sessionToken)
      
      try {
        const sesion = await prisma.sesionUsuario.findUnique({
          where: { token_sesion: sessionToken },
          include: {
            usuario: { include: { perfil_usuario: true } }
          }
        })
        
        if (!sesion) {
          console.log('❌ Sesión no encontrada')
          return null
        }
        
        const user = {
          id: sesion.usuario.usuario_id,
          email: sesion.usuario.correo_electronico,
          emailVerified: sesion.usuario.correo_verificado,
          name: sesion.usuario.perfil_usuario?.nombres + ' ' + sesion.usuario.perfil_usuario?.apellidos,
          image: sesion.usuario.perfil_usuario?.url_avatar,
        }
        
        const session = {
          sessionToken: sesion.token_sesion,
          userId: sesion.usuario_id,
          expires: sesion.fecha_expiracion,
        }
        
        console.log(' Sesión y usuario encontrados')
        return { session, user }
      } catch (error) {
        console.error('❌ Error en getSessionAndUser:', error)
        return null
      }
    },

    async updateSession({ sessionToken, expires }) {
      console.log(' Custom adapter: updateSession', sessionToken)
      
      try {
        await prisma.sesionUsuario.update({
          where: { token_sesion: sessionToken },
          data: { fecha_expiracion: expires }
        })
      } catch (error) {
        console.error('❌ Error en updateSession:', error)
      }
    },

    async deleteSession(sessionToken) {
      console.log(' Custom adapter: deleteSession', sessionToken)
      
      try {
        await prisma.sesionUsuario.delete({
          where: { token_sesion: sessionToken }
        })
      } catch (error) {
        console.error('❌ Error en deleteSession:', error)
      }
    },
  }
}