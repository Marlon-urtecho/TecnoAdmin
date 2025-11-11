// pages/api/products.js
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
      if (req.query?.id) {
        // Obtener un producto específico
        const product = await prisma.producto.findUnique({
          where: { producto_id: req.query.id },
          include: {
            categoria: {
              select: {
                categoria_id: true,
                nombre: true,
                slug: true
              }
            },
            marca: {
              select: {
                marca_id: true,
                nombre: true,
                url_logo: true
              }
            },
            proveedor: {
              select: {
                proveedor_id: true,
                nombre: true
              }
            },
            variantes: {
              where: { esta_activa: true },
              orderBy: { orden: 'asc' }
            },
            imagenes: {
              orderBy: { orden: 'asc' }
            },
            inventarios: {
              include: {
                variante: {
                  select: {
                    variante_id: true,
                    nombre_variante: true
                  }
                }
              }
            },
            _count: {
              select: {
                reseñas: {
                  where: { esta_aprobada: true }
                },
                variantes: true,
                imagenes: true
              }
            }
          }
        });

        if (!product) {
          return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(product);
      } else {
        // Obtener todos los productos con información básica
        const products = await prisma.producto.findMany({
          include: {
            categoria: {
              select: { 
                nombre: true,
                slug: true
              }
            },
            marca: {
              select: { 
                nombre: true,
                url_logo: true
              }
            },
            proveedor: {
              select: {
                nombre: true
              }
            },
            _count: {
              select: {
                variantes: true,
                imagenes: true,
                reseñas: {
                  where: { esta_aprobada: true }
                }
              }
            },
            inventarios: {
              select: {
                cantidad_disponible: true,
                alerta_stock_bajo: true
              }
            }
          },
          orderBy: { fecha_creacion: 'desc' }
        });
        res.json(products);
      }
    }

    if (method === 'POST') {
      const {
        sku, nombre, slug, descripcion, descripcion_corta,
        categoria_id, marca_id, proveedor_id, precio_base,
        precio_comparacion, precio_costo, controlar_inventario,
        permitir_pedidos_agotados, umbral_stock_bajo, peso_gramos,
        dimensiones, atributos, especificaciones, url_imagen_principal,
        es_destacado, esta_activo, es_digital, meta_titulo, meta_descripcion
      } = req.body;

      // Verificar si el SKU ya existe
      const existingSku = await prisma.producto.findUnique({
        where: { sku }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'El SKU ya existe' });
      }

      // Verificar si el slug ya existe
      const existingSlug = await prisma.producto.findUnique({
        where: { slug }
      });

      if (existingSlug) {
        return res.status(400).json({ error: 'El slug ya existe' });
      }

      const productDoc = await prisma.producto.create({
        data: {
          sku,
          nombre,
          slug,
          descripcion: descripcion || null,
          descripcion_corta: descripcion_corta || null,
          categoria_id,
          marca_id,
          proveedor_id,
          precio_base: parseFloat(precio_base),
          precio_comparacion: precio_comparacion ? parseFloat(precio_comparacion) : null,
          precio_costo: precio_costo ? parseFloat(precio_costo) : null,
          controlar_inventario: controlar_inventario !== undefined ? controlar_inventario : true,
          permitir_pedidos_agotados: permitir_pedidos_agotados !== undefined ? permitir_pedidos_agotados : false,
          umbral_stock_bajo: parseInt(umbral_stock_bajo) || 5,
          peso_gramos: peso_gramos ? parseInt(peso_gramos) : null,
          dimensiones: dimensiones || {},
          atributos: atributos || {},
          especificaciones: especificaciones || {},
          url_imagen_principal: url_imagen_principal || null,
          es_destacado: es_destacado !== undefined ? es_destacado : false,
          esta_activo: esta_activo !== undefined ? esta_activo : true,
          es_digital: es_digital !== undefined ? es_digital : false,
          meta_titulo: meta_titulo || null,
          meta_descripcion: meta_descripcion || null
        }
      });

      // Crear registro de inventario inicial para el producto base
      await prisma.inventario.create({
        data: {
          producto_id: productDoc.producto_id,
          cantidad_stock: 0,
          cantidad_reservada: 0,
          cantidad_disponible: 0,
          alerta_stock_bajo: false
        }
      });

      res.json(productDoc);
    }

    if (method === 'PUT') {
      const {
        producto_id, sku, nombre, slug, descripcion, descripcion_corta,
        categoria_id, marca_id, proveedor_id, precio_base,
        precio_comparacion, precio_costo, controlar_inventario,
        permitir_pedidos_agotados, umbral_stock_bajo, peso_gramos,
        dimensiones, atributos, especificaciones, url_imagen_principal,
        es_destacado, esta_activo, es_digital, meta_titulo, meta_descripcion
      } = req.body;

      // Verificar si el SKU ya existe (excluyendo el producto actual)
      const existingSku = await prisma.producto.findFirst({
        where: {
          sku,
          NOT: {
            producto_id: producto_id
          }
        }
      });

      if (existingSku) {
        return res.status(400).json({ error: 'El SKU ya existe' });
      }

      // Verificar si el slug ya existe (excluyendo el producto actual)
      const existingSlug = await prisma.producto.findFirst({
        where: {
          slug,
          NOT: {
            producto_id: producto_id
          }
        }
      });

      if (existingSlug) {
        return res.status(400).json({ error: 'El slug ya existe' });
      }

      await prisma.producto.update({
        where: { producto_id },
        data: {
          sku,
          nombre,
          slug,
          descripcion: descripcion || null,
          descripcion_corta: descripcion_corta || null,
          categoria_id,
          marca_id,
          proveedor_id,
          precio_base: parseFloat(precio_base),
          precio_comparacion: precio_comparacion ? parseFloat(precio_comparacion) : null,
          precio_costo: precio_costo ? parseFloat(precio_costo) : null,
          controlar_inventario,
          permitir_pedidos_agotados,
          umbral_stock_bajo: parseInt(umbral_stock_bajo) || 5,
          peso_gramos: peso_gramos ? parseInt(peso_gramos) : null,
          dimensiones: dimensiones || {},
          atributos: atributos || {},
          especificaciones: especificaciones || {},
          url_imagen_principal: url_imagen_principal || null,
          es_destacado,
          esta_activo,
          es_digital,
          meta_titulo: meta_titulo || null,
          meta_descripcion: meta_descripcion || null,
          fecha_actualizacion: new Date()
        }
      });
      res.json(true);
    }

    if (method === 'DELETE') {
      if (req.query?.id) {
        const productId = req.query.id;

        // Verificar si el producto tiene pedidos asociados
        const orderItemsCount = await prisma.itemPedido.count({
          where: { producto_id: productId }
        });

        if (orderItemsCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar un producto con pedidos asociados' 
          });
        }

        // Verificar si el producto está en carritos activos
        const cartItemsCount = await prisma.itemCarrito.count({
          where: { producto_id: productId }
        });

        if (cartItemsCount > 0) {
          return res.status(400).json({ 
            error: 'No se puede eliminar un producto que está en carritos de compra' 
          });
        }

        // Eliminar en cascada usando transacción
        await prisma.$transaction([
          // Primero eliminar dependencias
          prisma.transaccionInventario.deleteMany({
            where: {
              inventario: {
                producto_id: productId
              }
            }
          }),
          prisma.inventario.deleteMany({
            where: { producto_id: productId }
          }),
          prisma.imagenProducto.deleteMany({
            where: { producto_id: productId }
          }),
          prisma.varianteProducto.deleteMany({
            where: { producto_id: productId }
          }),
          prisma.resenaProducto.deleteMany({
            where: { producto_id: productId }
          }),
          prisma.itemListaDeseos.deleteMany({
            where: { producto_id: productId }
          }),
          // Luego eliminar el producto
          prisma.producto.delete({
            where: { producto_id: productId }
          })
        ]);

        res.json(true);
      }
    }
  } catch (error) {
    console.error('Error en API de productos:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'El SKU o slug ya existe para otro producto' 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el producto debido a referencias existentes' 
      });
    }
    
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}