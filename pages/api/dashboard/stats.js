// pages/api/dashboard/stats.js
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
    // Obtener estadísticas en paralelo para mejor performance
    const [
      totalOrders,
      pendingOrders,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalRevenue,
      recentOrders,
      totalCustomers
    ] = await Promise.all([
      // Total de órdenes
      prisma.pedido.count(),
      
      // Órdenes pendientes
      prisma.pedido.count({
        where: { estado: 'pendiente' }
      }),
      
      // Total de productos
      prisma.producto.count({
        where: { esta_activo: true }
      }),
      
      // Productos con stock bajo
      prisma.inventario.count({
        where: { 
          alerta_stock_bajo: true,
          cantidad_disponible: { gt: 0 }
        }
      }),
      
      // Productos sin stock
      prisma.inventario.count({
        where: { 
          cantidad_disponible: 0
        }
      }),
      
      // Ingresos totales (solo órdenes pagadas)
      prisma.pedido.aggregate({
        where: { estado_pago: 'pagado' },
        _sum: { monto_total: true }
      }),
      
      // Órdenes recientes (últimas 5)
      prisma.pedido.findMany({
        take: 5,
        include: {
          items: {
            include: {
              producto: {
                select: { nombre: true }
              }
            }
          }
        },
        orderBy: { fecha_creacion: 'desc' }
      }),
      
      // Total de clientes
      prisma.usuario.count({
        where: { 
          es_personal: false,
          esta_activo: true 
        }
      })
    ]);

    // Calcular crecimiento vs el mes anterior (simplificado)
    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    
    const lastMonthRevenue = await prisma.pedido.aggregate({
      where: { 
        estado_pago: 'pagado',
        fecha_creacion: {
          gte: lastMonth,
          lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        }
      },
      _sum: { monto_total: true }
    });

    const revenueGrowth = lastMonthRevenue._sum.monto_total 
      ? ((totalRevenue._sum.monto_total - lastMonthRevenue._sum.monto_total) / lastMonthRevenue._sum.monto_total * 100)
      : 0;

    const stats = {
      resumen: {
        total_ordenes: totalOrders,
        ordenes_pendientes: pendingOrders,
        total_productos: totalProducts,
        total_clientes: totalCustomers,
        ingresos_totales: totalRevenue._sum.monto_total || 0,
        crecimiento_ingresos: Math.round(revenueGrowth * 100) / 100
      },
      inventario: {
        stock_bajo: lowStockProducts,
        sin_stock: outOfStockProducts,
        porcentaje_stock_saludable: Math.round(((totalProducts - outOfStockProducts) / totalProducts) * 100)
      },
      ordenes_recientes: recentOrders.map(order => ({
        id: order.pedido_id,
        numero: order.numero_pedido,
        cliente: order.correo_cliente,
        total: order.monto_total,
        estado: order.estado,
        fecha: order.fecha_creacion,
        productos: order.items.length
      })),
      metricas_rapidas: {
        tasa_conversion: Math.round((totalOrders / totalCustomers) * 100) || 0,
        valor_promedio_orden: totalOrders > 0 ? (totalRevenue._sum.monto_total / totalOrders) : 0,
        productos_por_orden: await prisma.itemPedido.aggregate({
          _avg: { cantidad: true }
        })
      }
    };

    res.json(stats);

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}