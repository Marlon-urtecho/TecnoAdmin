import { CustomPrismaAdapter } from '@/lib/nextauth-adapter'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
      
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son requeridos")
        }

        try {
          // Usar el adapter para buscar el usuario
          const adapter = CustomPrismaAdapter()
          const user = await adapter.getUserByEmail(credentials.email)
          
          if (!user) {
            throw new Error("Usuario no encontrado")
          }

          // Buscar datos completos del usuario en la base de datos
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()
          
          const usuarioCompleto = await prisma.usuario.findUnique({
            where: { usuario_id: user.id },
            include: { perfil_usuario: true }
          })

          if (!usuarioCompleto) {
            console.log(' Usuario no encontrado en BD:', user.id)
            throw new Error("Usuario no encontrado")
          }

          if (!usuarioCompleto.esta_activo) {
            console.log(' Cuenta desactivada:', credentials.email)
            throw new Error("Cuenta desactivada")
          }

          // Verificar si tiene contraseña (usuarios de Google pueden no tenerla)
          if (!usuarioCompleto.hash_contrasena) {
            console.log(' Usuario no tiene contraseña configurada:', credentials.email)
            throw new Error("Este usuario no tiene contraseña configurada. Usa Google para iniciar sesión.")
          }

          // Verificar contraseña
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            usuarioCompleto.hash_contrasena
          )

          if (!isPasswordValid) {
            throw new Error("Contraseña incorrecta")
          }

         
          // Actualizar último acceso
          await prisma.usuario.update({
            where: { usuario_id: usuarioCompleto.usuario_id },
            data: { ultimo_acceso: new Date() }
          })

          await prisma.$disconnect()

          // DEFINIR CORRECTAMENTE SI ES ADMIN
          const isAdmin = usuarioCompleto.es_superusuario || 
                         usuarioCompleto.es_personal || 
                         usuarioCompleto.correo_electronico === 'urtechoalex065@gmail.com'

          // Retornar objeto de usuario para la sesión
          return {
            id: usuarioCompleto.usuario_id,
            email: usuarioCompleto.correo_electronico,
            name: usuarioCompleto.perfil_usuario ? 
              `${usuarioCompleto.perfil_usuario.nombres} ${usuarioCompleto.perfil_usuario.apellidos}` : 
              usuarioCompleto.correo_electronico,
            image: usuarioCompleto.perfil_usuario?.url_avatar,
            isAdmin: isAdmin,
            es_superusuario: usuarioCompleto.es_superusuario,
            es_personal: usuarioCompleto.es_personal,
          }
        } catch (error) {
          
          throw error
        }
      }
    })
  ],
  adapter: CustomPrismaAdapter(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(' signIn callback - User:', user?.email, 'Provider:', account.provider)
      
      //  permitir el login directamente
      if (account.provider === 'credentials') {
        return true
      }
      
      // Para Google, necesitamos buscar/crear el usuario y devolver los datos
      if (account.provider === 'google') {
        try {
          const { PrismaClient } = await import('@prisma/client')
          const prisma = new PrismaClient()

          // Buscar usuario existente
          const usuarioExistente = await prisma.usuario.findUnique({
            where: { correo_electronico: user.email },
            include: { 
              perfil_usuario: true,
              cuentas_oauth: {
                include: { proveedor: true }
              } 
            }
          })

          let usuarioFinal = usuarioExistente;

          if (usuarioExistente) {
            // Verificar si ya tiene cuenta OAuth para este proveedor
            const cuentaExistente = usuarioExistente.cuentas_oauth.find(
              cuenta => cuenta.id_usuario_proveedor === account.providerAccountId && 
                       cuenta.proveedor.nombre === account.provider
            )

            if (!cuentaExistente) {
         
              // Buscar proveedor
              let proveedor = await prisma.proveedorOAuth.findFirst({
                where: { nombre: account.provider }
              })

              if (!proveedor) {
                console.log(' Creando proveedor OAuth...')
                proveedor = await prisma.proveedorOAuth.create({
                  data: {
                    nombre: account.provider,
                    cliente_id: 'auto-from-signin',
                    secreto_cliente: 'auto-from-signin',
                    esta_activo: true,
                    configuracion: {},
                    fecha_creacion: new Date()
                  }
                })
              }

              // Crear cuenta OAuth
              await prisma.cuentaOAuth.create({
                data: {
                  usuario_id: usuarioExistente.usuario_id,
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
              
              console.log('✅ Cuenta OAuth creada exitosamente')
            } else {
              console.log('ℹ️ Cuenta OAuth ya existe')
            }

            // Actualizar último acceso
            await prisma.usuario.update({
              where: { usuario_id: usuarioExistente.usuario_id },
              data: { 
                ultimo_acceso: new Date(),
                correo_verificado: true // Marcar email como verificado con Google
              }
            })
          } else {
            console.log('🆕 Creando nuevo usuario para Google...')
            
            // Buscar proveedor
            let proveedor = await prisma.proveedorOAuth.findFirst({
              where: { nombre: account.provider }
            })

            if (!proveedor) {
              console.log('🆕 Creando proveedor OAuth...')
              proveedor = await prisma.proveedorOAuth.create({
                data: {
                  nombre: account.provider,
                  cliente_id: 'auto-from-signin',
                  secreto_cliente: 'auto-from-signin',
                  esta_activo: true,
                  configuracion: {},
                  fecha_creacion: new Date()
                }
              })
            }

            // Crear nuevo usuario con Google
            usuarioFinal = await prisma.usuario.create({
              data: {
                correo_electronico: user.email,
                correo_verificado: true,
                hash_contrasena: await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 12),
                esta_activo: true,
                es_personal: false,
                es_superusuario: user.email === 'urtechoalex065@gmail.com', // ← Hacer admin si es tu email
                ultimo_acceso: new Date(),
                perfil_usuario: {
                  create: {
                    nombres: profile.given_name || user.name?.split(' ')[0] || 'Usuario',
                    apellidos: profile.family_name || user.name?.split(' ').slice(1).join(' ') || 'Google',
                    url_avatar: user.image,
                    suscrito_boletin: false,
                    acepta_marketing: false
                  }
                },
                cuentas_oauth: {
                  create: {
                    proveedor_id: proveedor.proveedor_id,
                    id_usuario_proveedor: account.providerAccountId,
                    token_acceso: account.access_token,
                    token_actualizacion: account.refresh_token,
                    token_expiracion: account.expires_at ? new Date(account.expires_at * 1000) : null,
                    alcance: account.scope
                  }
                }
              },
              include: {
                perfil_usuario: true
              }
            })
            
            console.log('✅ Nuevo usuario creado:', usuarioFinal.usuario_id)
          }

          // ACTUALIZAR EL OBJETO USER CON LOS DATOS DE LA BD
          user.id = usuarioFinal.usuario_id
          user.isAdmin = usuarioFinal.es_superusuario || 
                        usuarioFinal.es_personal || 
                        usuarioFinal.correo_electronico === 'urtechoalex065@gmail.com'
          user.es_superusuario = usuarioFinal.es_superusuario
          user.es_personal = usuarioFinal.es_personal
          
          console.log('✅ User actualizado para JWT:', {
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin
          })

          await prisma.$disconnect()
          return true
        } catch (error) {
          console.error('❌ Error en signIn callback:', error)
          await prisma.$disconnect()
          return false
        }
      }
      
      return true
    },
    
    async jwt({ token, user, account, profile }) {
      console.log('🔄 JWT callback - Token:', token, 'User:', user)
      
      // Persistir datos del usuario en el token cuando inicia sesión
      if (user) {
        token.id = user.id
        token.email = user.email
        token.isAdmin = user.isAdmin
        token.es_superusuario = user.es_superusuario
        token.es_personal = user.es_personal
        
        console.log('✅ Datos de usuario agregados al token:', {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin
        })
      }
      
      // Si es Google y no tenemos user (primer login), establecer isAdmin basado en email
      if (account?.provider === 'google' && !token.isAdmin) {
        token.isAdmin = token.email === 'urtechoalex065@gmail.com'
        console.log('🔍 Estableciendo isAdmin para Google:', token.isAdmin)
      }
      
      return token
    },
    
    async session({ session, token }) {
      console.log('💼 Session callback - Token:', token)
      
      // Enviar datos del token a la sesión
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.isAdmin = token.isAdmin
        session.user.es_superusuario = token.es_superusuario
        session.user.es_personal = token.es_personal
        
        console.log('✅ Datos de sesión establecidos:', {
          id: session.user.id,
          email: session.user.email,
          isAdmin: session.user.isAdmin
        })
        
        // Mantener la imagen de Google si está disponible
        if (token.picture) {
          session.user.image = token.picture
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)