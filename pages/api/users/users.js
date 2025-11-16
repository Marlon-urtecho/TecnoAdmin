import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "./auth/[...nextauth]"
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  const { method, query } = req
  
  try {
    // Verificar autenticación usando tu configuración de NextAuth
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ error: "No autenticado" })
    }

    // VERIFICACIÓN CORREGIDA: Usar la misma lógica que en productos
    const adminEmails = ['urtechoalex065@gmail.com'];
    if (!adminEmails.includes(session.user.email)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (method === 'GET') {
      if (query?.id) {
        // Obtener un usuario específico
        const user = await prisma.usuario.findUnique({
          where: { usuario_id: query.id },
          include: {
            perfil_usuario: true,
            direcciones: {
              where: { es_principal: true },
              take: 1
            },
            cuentas_oauth: {
              select: {
                proveedor: {
                  select: {
                    nombre: true
                  }
                },
                fecha_creacion: true
              }
            },
            _count: {
              select: {
                pedidos: true,
                carritos: true,
                metodos_pago: true,
                sesiones_usuario: true
              }
            }
          }
        })

        if (!user) {
          return res.status(404).json({ error: 'Usuario no encontrado' })
        }

        // Excluir información sensible
        const { hash_contrasena, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
      } else {
        // Obtener todos los usuarios (sin paginación para simplificar)
        const users = await prisma.usuario.findMany({
          include: {
            perfil_usuario: {
              select: {
                nombres: true,
                apellidos: true,
                url_avatar: true,
                fecha_nacimiento: true
              }
            },
            _count: {
              select: {
                pedidos: true,
                carritos: true,
                sesiones_usuario: {
                  where: {
                    fecha_expiracion: {
                      gt: new Date()
                    }
                  }
                }
              }
            }
          },
          orderBy: { fecha_registro: 'desc' }
        })

        // Excluir contraseñas de todos los usuarios
        const usersWithoutPasswords = users.map(({ hash_contrasena, ...user }) => user)

        res.json({
          users: usersWithoutPasswords,
          total: users.length
        })
      }
    }

    // ... el resto de tu código POST, PUT, DELETE se mantiene igual
    if (method === 'POST') {
      const {
        correo_electronico,
        password,
        numero_telefono,
        esta_activo = true,
        es_personal = false,
        es_superusuario = false,
        // Datos del perfil
        nombres,
        apellidos,
        fecha_nacimiento,
        genero,
        url_avatar,
        suscrito_boletin = true,
        acepta_marketing = true
      } = req.body

      // Verificar si el usuario ya existe
      const existingUser = await prisma.usuario.findUnique({
        where: { correo_electronico }
      })

      if (existingUser) {
        return res.status(400).json({ error: 'El usuario ya existe' })
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 12)

      // Crear usuario y perfil
      const user = await prisma.usuario.create({
        data: {
          correo_electronico,
          hash_contrasena: hashedPassword,
          numero_telefono: numero_telefono || null,
          esta_activo,
          es_personal,
          es_superusuario,
          perfil_usuario: {
            create: {
              nombres,
              apellidos,
              fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
              genero,
              url_avatar: url_avatar || null,
              suscrito_boletin,
              acepta_marketing
            }
          }
        },
        include: {
          perfil_usuario: true
        }
      })

      const { hash_contrasena, ...userWithoutPassword } = user
      res.json({
        success: true,
        data: userWithoutPassword,
        message: 'Usuario creado exitosamente'
      })
    }

    // ... resto del código
  } catch (error) {
    console.error('Error en API de usuarios:', error)
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'El email ya está en uso' 
      })
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el usuario debido a referencias existentes' 
      })
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    })
  }
}