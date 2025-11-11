import { CustomPrismaAdapter } from '@/lib/nextauth-adapter'
import { PrismaClient } from '@prisma/client'
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const prisma = new PrismaClient()

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  adapter: CustomPrismaAdapter(),
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(' signIn callback - User:', user.email)
      
      try {
        // Buscar usuario existente
        const usuarioExistente = await prisma.usuario.findUnique({
          where: { correo_electronico: user.email },
          include: { cuentas_oauth: true }
        })

        if (usuarioExistente) {
          console.log(' Usuario existente encontrado:', usuarioExistente.usuario_id)
          
          // Verificar si ya tiene cuenta OAuth para este proveedor
          const cuentaExistente = await prisma.cuentaOAuth.findFirst({
            where: {
              usuario_id: usuarioExistente.usuario_id,
              id_usuario_proveedor: account.providerAccountId,
              proveedor: { nombre: account.provider }
            }
          })

          if (!cuentaExistente) {
            console.log(' Creando cuenta OAuth para usuario existente...')
            
            // Buscar proveedor
            let proveedor = await prisma.proveedorOAuth.findFirst({
              where: { nombre: account.provider }
            })

            if (!proveedor) {
              console.log('🔧 Creando proveedor OAuth...')
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
            
            console.log(' Cuenta OAuth creada exitosamente')
          } else {
            console.log(' Cuenta OAuth ya existe')
          }
        }
        
        return true
      } catch (error) {
        console.error(' Error en signIn callback:', error)
        return false
      }
    },
    
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
        session.user.isAdmin = session.user.email === 'urtechoalex065@gmail.com'
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

export default NextAuth(authOptions)