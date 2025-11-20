// pages/api/dashboard/activity.js
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const isAdmin = session.user.isAdmin || 
                  session.user.es_superusuario || 
                  session.user.es_personal;

  if (!isAdmin) {
    return res.status(403).json({ error: "No autorizado" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener actividad reciente de múltiples fuentes
    const [
      recentOrders,
      inventoryChanges,
      newCustomers,
      productUpdates
    ] = await Promise.all([
      // Últimas órdenes
      prisma.pedido.findMany({
        take: 10,
        select: {
          pedido_id: true,
          numero_pedido: true,
          correo_cliente: true,
          estado: true,
          monto_total: true,
          fecha_creacion: true
        },
        orderBy: { fecha_creacion: 'desc' }
      }),

      // Cambios recientes en inventario
      prisma.transaccionInventario.findMany({
        take: 10,
        include: {
          inventario: {
            include: {
              producto: {
                select: { nombre: true, sku: true }
              }
            }
          },
          usuario: {
            select: {
              perfil_usuario: {
                select: { nombres: true, apellidos: true }
              }
            }
          }
        },
        orderBy: { fecha_creacion: 'desc' }
      }),

      // Nuevos clientes
      prisma.usuario.findMany({
        take: 5,
        where: { 
          es_personal: false,
          fecha_registro: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
          }
        },
        include: {
          perfil_usuario: {
            select: { nombres: true, apellidos: true }
          }
        },
        orderBy: { fecha_registro: 'desc' }
      }),

      // Productos actualizados recientemente
      prisma.producto.findMany({
        take: 5,
        where: {
          fecha_actualizacion: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          producto_id: true,
          nombre: true,
          sku: true,
          fecha_actualizacion: true,
          precio_base: true
        },
        orderBy: { fecha_actualizacion: 'desc' }
      })
    ]);

    const activity = {
      ordenes: recentOrders.map(order => ({
        type: 'orden',
        id: order.pedido_id,
        title: `Nueva orden #${order.numero_pedido}`,
        description: `${order.correo_cliente} - $${order.monto_total}`,
        status: order.estado,
        timestamp: order.fecha_creacion,
        action: `/orders/${order.pedido_id}`
      })),

      inventario: inventoryChanges.map(change => ({
        type: 'inventario',
        id: change.transaccion_id,
        title: `Ajuste de inventario - ${change.inventario.producto.nombre}`,
        description: `${change.tipo_transaccion}: ${change.cambio_cantidad} unidades`,
        user: change.usuario?.perfil_usuario ? 
          `${change.usuario.perfil_usuario.nombres} ${change.usuario.perfil_usuario.apellidos}` : 'Sistema',
        timestamp: change.fecha_creacion,
        action: '/inventario'
      })),

      clientes: newCustomers.map(customer => ({
        type: 'cliente',
        id: customer.usuario_id,
        title: `Nuevo cliente registrado`,
        description: customer.perfil_usuario ? 
          `${customer.perfil_usuario.nombres} ${customer.perfil_usuario.apellidos}` : 
          customer.correo_electronico,
        timestamp: customer.fecha_registro,
        action: '/users'
      })),

      productos: productUpdates.map(product => ({
        type: 'producto',
        id: product.producto_id,
        title: `Producto actualizado - ${product.nombre}`,
        description: `SKU: ${product.sku} - $${product.precio_base}`,
        timestamp: product.fecha_actualizacion,
        action: `/products/${product.producto_id}`
      }))
    };

    // Combinar y ordenar toda la actividad por fecha
    const allActivity = [
      ...activity.ordenes,
      ...activity.inventario,
      ...activity.clientes,
      ...activity.productos
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 15); // Mostrar solo las 15 más recientes

    res.json(allActivity);

  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}