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

  if (req.method === 'GET') {
    await handleGetEstadisticas(req, res);
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}

async function handleGetEstadisticas(req, res) {
  try {
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtros de fecha
    const fechaWhere = {};
    if (fechaInicio || fechaFin) {
      fechaWhere.fecha_creacion = {};
      if (fechaInicio) fechaWhere.fecha_creacion.gte = new Date(fechaInicio);
      if (fechaFin) {
        const fechaFinObj = new Date(fechaFin);
        fechaFinObj.setHours(23, 59, 59, 999);
        fechaWhere.fecha_creacion.lte = fechaFinObj;
      }
    }

    // Obtener estadísticas en paralelo
    const [
      totalVentas,
      ingresosTotales,
      totalProductosVendidos,
      ventasPorEstado,
      ventasHoy,
      clientesUnicos,
      ventasClientesRecurrentes
    ] = await Promise.all([
      // Total de ventas
      prisma.pedido.count({
        where: fechaWhere
      }),

      // Ingresos totales (solo ventas pagadas)
      prisma.pedido.aggregate({
        where: {
          ...fechaWhere,
          estado_pago: 'pagado'
        },
        _sum: {
          monto_total: true
        }
      }),

      // Total de productos vendidos
      prisma.itemPedido.aggregate({
        where: {
          pedido: {
            ...fechaWhere,
            estado_pago: 'pagado'
          }
        },
        _sum: {
          cantidad: true
        }
      }),

      // Ventas por estado
      prisma.pedido.groupBy({
        by: ['estado'],
        where: fechaWhere,
        _count: {
          _all: true
        }
      }),

      // Ventas de hoy
      prisma.pedido.count({
        where: {
          fecha_creacion: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),

      // Clientes únicos
      prisma.pedido.groupBy({
        by: ['correo_cliente'],
        where: {
          ...fechaWhere,
          estado_pago: 'pagado'
        },
        _count: {
          _all: true
        }
      }),

      // Clientes recurrentes (más de 1 compra)
      prisma.pedido.groupBy({
        by: ['correo_cliente'],
        where: {
          ...fechaWhere,
          estado_pago: 'pagado'
        },
        _count: {
          _all: true
        },
        having: {
          correo_cliente: {
            _count: {
              gt: 1
            }
          }
        }
      })
    ]);

    // Calcular métricas derivadas
    const ingresosPromedio = totalVentas > 0 ? (ingresosTotales._sum.monto_total || 0) / totalVentas : 0;
    const productosPorVenta = totalVentas > 0 ? (totalProductosVendidos._sum.cantidad || 0) / totalVentas : 0;
    const tasaConversion = clientesUnicos.length > 0 ? (totalVentas / clientesUnicos.length) * 100 : 0;

    // Formatear ventas por estado
    const ventasPorEstadoObj = {};
    ventasPorEstado.forEach(item => {
      ventasPorEstadoObj[item.estado] = item._count._all;
    });

    const estadisticas = {
      totalVentas,
      ingresosTotales: ingresosTotales._sum.monto_total || 0,
      ingresosPromedio,
      totalProductosVendidos: totalProductosVendidos._sum.cantidad || 0,
      productosPorVenta: Math.round(productosPorVenta * 100) / 100,
      ventasPorEstado: ventasPorEstadoObj,
      ventasHoy,
      clientesUnicos: clientesUnicos.length,
      clientesRecurrentes: ventasClientesRecurrentes.length,
      tasaConversion: Math.round(tasaConversion * 100) / 100
    };

    res.json(estadisticas);

  } catch (error) {
    console.error('Error fetching estadísticas:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}