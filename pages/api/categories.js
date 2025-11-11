
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
    
    // Verificar si es admin basado en el email
    const adminEmails = ['urtechoalex065@gmail.com'];
    if (!adminEmails.includes(session.user.email)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    if (method === 'GET') {
      const categories = await prisma.categoria.findMany({
        include: {
          _count: {
            select: { productos: true }
          },
          padre: {
            select: {
              categoria_id: true,
              nombre: true,
              slug: true
            }
          },
          hijos: {
            select: {
              categoria_id: true,
              nombre: true,
              slug: true
            }
          }
        },
        orderBy: { orden: 'asc' }
      });
      res.json(categories);
    }

    if (method === 'POST') {
      const { 
        nombre, 
        descripcion, 
        slug, 
        categoria_padre_id, 
        url_imagen, 
        orden, 
        esta_activa,
        propiedades 
      } = req.body;
      
      // Verificar si el slug ya existe
      const existingCategory = await prisma.categoria.findUnique({
        where: { slug }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'El slug ya existe' });
      }

      const category = await prisma.categoria.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          slug,
          categoria_padre_id: categoria_padre_id || null,
          url_imagen: url_imagen || null,
          orden: orden ? parseInt(orden) : 0,
          esta_activa: esta_activa !== undefined ? esta_activa : true,
          metadatos_seo: propiedades && propiedades.length > 0 ? { propiedades } : {}
        }
      });
      res.json(category);
    }

    if (method === 'PUT') {
      const { 
        categoria_id,
        nombre, 
        descripcion, 
        slug, 
        categoria_padre_id, 
        url_imagen, 
        orden, 
        esta_activa,
        propiedades 
      } = req.body;

      // Verificar si el slug ya existe (excluyendo la categoría actual)
      const existingCategory = await prisma.categoria.findFirst({
        where: {
          slug,
          NOT: {
            categoria_id: categoria_id
          }
        }
      });

      if (existingCategory) {
        return res.status(400).json({ error: 'El slug ya existe' });
      }

      await prisma.categoria.update({
        where: { categoria_id },
        data: {
          nombre,
          descripcion: descripcion || null,
          slug,
          categoria_padre_id: categoria_padre_id || null,
          url_imagen: url_imagen || null,
          orden: orden ? parseInt(orden) : 0,
          esta_activa,
          metadatos_seo: propiedades && propiedades.length > 0 ? { propiedades } : {},
          fecha_actualizacion: new Date()
        }
      });
      res.json(true);
    }

    if (method === 'DELETE') {
      if (req.query?.id) {
        const categoryId = req.query.id;

        // Verificar si tiene productos asociados
        const productsCount = await prisma.producto.count({
          where: { categoria_id: categoryId }
        });

        if (productsCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar una categoría con productos asociados' 
          });
        }

        // Verificar si tiene subcategorías
        const subcategoriesCount = await prisma.categoria.count({
          where: { categoria_padre_id: categoryId }
        });

        if (subcategoriesCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar una categoría con subcategorías' 
          });
        }

        await prisma.categoria.delete({
          where: { categoria_id: categoryId }
        });
        res.json(true);
      }
    }
  } catch (error) {
    console.error('Error en API de categorías:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'El slug ya existe' });
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}