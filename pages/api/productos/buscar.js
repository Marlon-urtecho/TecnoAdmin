import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "No autenticado" });
    }

    // Verificar si es admin
    const isAdmin = session.user.isAdmin || 
                    session.user.es_superusuario || 
                    session.user.es_personal || 
                    session.user.email === 'urtechoalex065@gmail.com';

    if (!isAdmin) {
      return res.status(403).json({ error: "No autorizado - Se requieren permisos de administrador" });
    }

    const { 
      disponibles = 'true',
      incluirVariantes = 'true',
      busqueda = '',
      categoria = '',
      marca = '',
      pagina = '1',
      limite = '100'
    } = req.query;

    const page = parseInt(pagina);
    const limit = parseInt(limite);
    const skip = (page - 1) * limit;

    // Construir filtros
    const where = {
      esta_activo: true
    };

    // Filtro por disponibilidad
    if (disponibles === 'true') {
      where.OR = [
        { controlar_inventario: false },
        {
          controlar_inventario: true,
          inventarios: {
            some: {
              cantidad_disponible: { gt: 0 }
            }
          }
        }
      ];
    }

    // Filtro por búsqueda
    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { sku: { contains: busqueda, mode: 'insensitive' } },
        { descripcion: { contains: busqueda, mode: 'insensitive' } }
      ];
    }

    // Filtro por categoría
    if (categoria) {
      where.categoria_id = categoria;
    }

    // Filtro por marca
    if (marca) {
      where.marca_id = marca;
    }

    // Configurar relaciones a incluir
    const include = {
      categoria: {
        select: {
          nombre: true,
          categoria_id: true
        }
      },
      marca: {
        select: {
          nombre: true,
          marca_id: true
        }
      },
      inventarios: {
        where: {
          variante_id: null // Solo inventario del producto base
        },
        select: {
          cantidad_disponible: true,
          cantidad_stock: true,
          cantidad_reservada: true,
          alerta_stock_bajo: true
        }
      }
    };

    // Incluir variantes si se solicita
    if (incluirVariantes === 'true') {
      include.variantes = {
        where: { esta_activa: true },
        orderBy: { orden: 'asc' },
        include: {
          inventario: {
            select: {
              cantidad_disponible: true,
              cantidad_stock: true,
              cantidad_reservada: true
            }
          }
        }
      };
    }

    // Obtener productos
    const productos = await prisma.producto.findMany({
      where,
      include,
      orderBy: { nombre: 'asc' },
      skip,
      take: limit
    });

    res.json(productos);

  } catch (error) {
    console.error('Error en búsqueda de productos:', error);
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}