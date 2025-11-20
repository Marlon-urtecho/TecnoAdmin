import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  
  try {
    // Verificar autenticación y permisos de admin
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({ error: "No autenticado" });
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
      if (req.query?.id) {
        // Obtener una marca específica
        const brand = await prisma.marca.findUnique({
          where: { marca_id: req.query.id },
          include: {
            productos: {
              select: {
                producto_id: true,
                nombre: true,
                sku: true,
                precio_base: true,
                esta_activo: true,
                url_imagen_principal: true
              }
            },
            _count: {
              select: {
                productos: true
              }
            }
          }
        });

        if (!brand) {
          return res.status(404).json({ error: 'Marca no encontrada' });
        }

        res.json(brand);
      } else {
        // Obtener todas las marcas - CORREGIDO el orderBy
        const brands = await prisma.marca.findMany({
          include: {
            _count: {
              select: {
                productos: true
              }
            }
          },
          orderBy: [
            { orden: 'asc' },
            { nombre: 'asc' }
          ]
        });
        
        // Asegurar que cada marca tenga _count
        const brandsWithCount = brands.map(brand => ({
          ...brand,
          _count: brand._count || { productos: 0 }
        }));
        
        res.json(brandsWithCount);
      }
    }

    if (method === 'POST') {
      const {
        nombre,
        descripcion,
        url_logo,
        url_sitio_web,
        orden,
        esta_activa
      } = req.body;

      // Verificar si el nombre ya existe
      const existingBrand = await prisma.marca.findFirst({
        where: { nombre }
      });

      if (existingBrand) {
        return res.status(400).json({ error: 'Ya existe una marca con este nombre' });
      }

      const brandDoc = await prisma.marca.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          url_logo: url_logo || null,
          url_sitio_web: url_sitio_web || null,
          orden: orden ? parseInt(orden) : 0,
          esta_activa: esta_activa !== undefined ? esta_activa : true
        }
      });

      res.json(brandDoc);
    }

    if (method === 'PUT') {
      const {
        marca_id,
        nombre,
        descripcion,
        url_logo,
        url_sitio_web,
        orden,
        esta_activa
      } = req.body;

      // Verificar si el nombre ya existe (excluyendo la marca actual)
      const existingBrand = await prisma.marca.findFirst({
        where: {
          nombre,
          NOT: {
            marca_id: marca_id
          }
        }
      });

      if (existingBrand) {
        return res.status(400).json({ error: 'Ya existe una marca con este nombre' });
      }

      await prisma.marca.update({
        where: { marca_id },
        data: {
          nombre,
          descripcion: descripcion || null,
          url_logo: url_logo || null,
          url_sitio_web: url_sitio_web || null,
          orden: orden ? parseInt(orden) : 0,
          esta_activa,
          fecha_actualizacion: new Date()
        }
      });
      res.json(true);
    }

    if (method === 'DELETE') {
      if (req.query?.id) {
        const brandId = req.query.id;

        // Verificar si la marca tiene productos asociados
        const productsCount = await prisma.producto.count({
          where: { marca_id: brandId }
        });

        if (productsCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar una marca con productos asociados' 
          });
        }

        await prisma.marca.delete({
          where: { marca_id: brandId }
        });
        res.json(true);
      }
    }
  } catch (error) {
    console.error('Error en API de marcas:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Ya existe una marca con este nombre' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}