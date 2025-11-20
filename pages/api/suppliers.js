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
        // Obtener un proveedor específico
        const supplier = await prisma.proveedor.findUnique({
          where: { proveedor_id: req.query.id },
          include: {
            productos: {
              select: {
                producto_id: true,
                nombre: true,
                sku: true,
                precio_base: true,
                esta_activo: true
              }
            },
            _count: {
              select: {
                productos: true
              }
            }
          }
        });

        if (!supplier) {
          return res.status(404).json({ error: 'Proveedor no encontrado' });
        }

        res.json(supplier);
      } else {
        // Obtener todos los proveedores
        const suppliers = await prisma.proveedor.findMany({
          include: {
            _count: {
              select: {
                productos: true
              }
            }
          },
        orderBy: [
          { fecha_creacion: 'desc' }  
        ]
        });
        res.json(suppliers);
      }
    }

    if (method === 'POST') {
      const {
        nombre,
        persona_contacto,
        correo_electronico,
        numero_telefono,
        url_sitio_web,
        esta_activo
      } = req.body;

      // Verificar si el nombre ya existe
      const existingSupplier = await prisma.proveedor.findFirst({
        where: { nombre }
      });

      if (existingSupplier) {
        return res.status(400).json({ error: 'Ya existe un proveedor con este nombre' });
      }

      const supplierDoc = await prisma.proveedor.create({
        data: {
          nombre,
          persona_contacto: persona_contacto || null,
          correo_electronico: correo_electronico || null,
          numero_telefono: numero_telefono || null,
          url_sitio_web: url_sitio_web || null,
          esta_activo: esta_activo !== undefined ? esta_activo : true
        }
      });

      res.json(supplierDoc);
    }

    if (method === 'PUT') {
      const {
        proveedor_id,
        nombre,
        persona_contacto,
        correo_electronico,
        numero_telefono,
        url_sitio_web,
        esta_activo
      } = req.body;

      // Verificar si el nombre ya existe (excluyendo el proveedor actual)
      const existingSupplier = await prisma.proveedor.findFirst({
        where: {
          nombre,
          NOT: {
            proveedor_id: proveedor_id
          }
        }
      });

      if (existingSupplier) {
        return res.status(400).json({ error: 'Ya existe un proveedor con este nombre' });
      }

      await prisma.proveedor.update({
        where: { proveedor_id },
        data: {
          nombre,
          persona_contacto: persona_contacto || null,
          correo_electronico: correo_electronico || null,
          numero_telefono: numero_telefono || null,
          url_sitio_web: url_sitio_web || null,
          esta_activo,
          fecha_actualizacion: new Date()
        }
      });
      res.json(true);
    }

    if (method === 'DELETE') {
      if (req.query?.id) {
        const supplierId = req.query.id;

        // Verificar si el proveedor tiene productos asociados
        const productsCount = await prisma.producto.count({
          where: { proveedor_id: supplierId }
        });

        if (productsCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar un proveedor con productos asociados' 
          });
        }

        await prisma.proveedor.delete({
          where: { proveedor_id: supplierId }
        });
        res.json(true);
      }
    }
  } catch (error) {
    console.error('Error en API de proveedores:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'Ya existe un proveedor con este nombre' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}