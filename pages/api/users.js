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

   // Por esta verificación más robusta:
    const isAdmin = session.user.isAdmin || 
                session.user.es_superusuario || 
                session.user.es_personal || 
                session.user.email === 'urtechoalex065@gmail.com';

    if (!isAdmin) {
          return res.status(403).json({ error: "No autorizado - Se requieren permisos de administrador" });
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

      // MAPEO CORREGIDO - usar minúsculas como está en el enum
      const mapGeneroToEnum = (genero) => {
        if (!genero) return null;
        
        const generoMap = {
          // Mapeo desde los valores del frontend a los valores del enum en minúsculas
          'MASCULINO': 'masculino',
          'FEMENINO': 'femenino',
          'OTRO': 'prefiere_no_decir', 
          'NO_ESPECIFICADO': 'prefiere_no_decir',
          'M': 'masculino',
          'F': 'femenino', 
          'O': 'prefiere_no_decir',
          'N': 'prefiere_no_decir'
        };
        
        return generoMap[genero] || null;
      };

      const generoEnum = mapGeneroToEnum(genero);

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
              genero: generoEnum, // ← Ahora en minúsculas
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
      
      console.log('Usuario creado exitosamente:', user.usuario_id);
      
      res.status(201).json({
        success: true,
        data: userWithoutPassword,
        message: 'Usuario creado exitosamente'
      })
    }

    // MÉTODO PUT PARA EDITAR USUARIOS - ¡ESTO ES LO QUE FALTABA!
    if (method === 'PUT') {
      const {
        usuario_id,
        correo_electronico,
        password,
        numero_telefono,
        esta_activo,
        es_personal,
        es_superusuario,
        // Datos del perfil
        nombres,
        apellidos,
        fecha_nacimiento,
        genero,
        url_avatar,
        suscrito_boletin,
        acepta_marketing
      } = req.body

      console.log('Datos recibidos en API PUT:', req.body);
      console.log('Usuario ID:', usuario_id);

      if (!usuario_id) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
      }

      // Verificar si el usuario existe
      const existingUser = await prisma.usuario.findUnique({
        where: { usuario_id },
        include: { perfil_usuario: true }
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar si el email ya está en uso por otro usuario
      if (correo_electronico && correo_electronico !== existingUser.correo_electronico) {
        const emailUser = await prisma.usuario.findUnique({
          where: { correo_electronico }
        });
        
        if (emailUser && emailUser.usuario_id !== usuario_id) {
          return res.status(400).json({ error: 'El email ya está en uso por otro usuario' });
        }
      }

      // Mapeo del género
      const mapGeneroToEnum = (genero) => {
        if (!genero) return null;
        
        const generoMap = {
          'MASCULINO': 'masculino',
          'FEMENINO': 'femenino',
          'OTRO': 'prefiere_no_decir', 
          'NO_ESPECIFICADO': 'prefiere_no_decir',
          'M': 'masculino',
          'F': 'femenino', 
          'O': 'prefiere_no_decir',
          'N': 'prefiere_no_decir',
          'masculino': 'masculino',
          'femenino': 'femenino',
          'prefiere_no_decir': 'prefiere_no_decir'
        };
        
        return generoMap[genero] || null;
      };

      const generoEnum = mapGeneroToEnum(genero);
     
      // Preparar datos de actualización
      const updateData = {
        correo_electronico,
        numero_telefono: numero_telefono || null,
        esta_activo,
        es_personal,
        es_superusuario,
        perfil_usuario: {
          update: {
            nombres,
            apellidos,
            fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
            genero: generoEnum,
            url_avatar: url_avatar || null,
            suscrito_boletin,
            acepta_marketing
          }
        }
      };

      // Si se proporciona una nueva contraseña, hashearla
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateData.hash_contrasena = hashedPassword;
      }

      console.log('Datos de actualización:', updateData);

      // Actualizar usuario
      const updatedUser = await prisma.usuario.update({
        where: { usuario_id },
        data: updateData,
        include: {
          perfil_usuario: true
        }
      });

      const { hash_contrasena, ...userWithoutPassword } = updatedUser;

      console.log('Usuario actualizado exitosamente:', usuario_id);

      res.json({
        success: true,
        data: userWithoutPassword,
        message: 'Usuario actualizado correctamente'
      });
    }

    // MÉTODO DELETE PARA ELIMINAR USUARIOS
    if (method === 'DELETE') {
      if (!query.id) {
        return res.status(400).json({ error: 'ID de usuario es requerido' });
      }

      // Verificar si el usuario existe
      const existingUser = await prisma.usuario.findUnique({
        where: { usuario_id: query.id }
      });

      if (!existingUser) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Eliminar usuario (esto eliminará en cascada el perfil_usuario debido a la relación)
      await prisma.usuario.delete({
        where: { usuario_id: query.id }
      });

      console.log('Usuario eliminado exitosamente:', query.id);

      res.json({
        success: true,
        message: 'Usuario eliminado correctamente'
      });
    }

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

    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      })
    }
    
    // Manejar error específico del enum de género
    if (error.message.includes('Invalid value for argument `genero`')) {
      return res.status(400).json({ 
        error: `Valor de género inválido. Valores permitidos: masculino, femenino, prefiere_no_decir. Se recibió: ${req.body?.genero}` 
      })
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    })
  }
}