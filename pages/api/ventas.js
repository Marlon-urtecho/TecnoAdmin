import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]"
import { prisma } from "@/lib/prisma"

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: "No autenticado" })
  }

  const isAdmin = session.user.isAdmin || 
                  session.user.es_superusuario || 
                  session.user.es_personal || 
                  session.user.email === 'urtechoalex065@gmail.com'

  if (!isAdmin) {
    return res.status(403).json({ error: "No autorizado" })
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { fechaInicio, fechaFin } = req.query;

    const whereClause = {
      fecha_creacion: {
        gte: fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lte: fechaFin ? new Date(fechaFin) : new Date()
      },
      estado: {
        in: ['entregado', 'enviado', 'procesando']
      }
    }

    // Estadísticas de ventas
    const estadisticasVentas = await prisma.pedido.aggregate({
      where: whereClause,
      _count: {
        pedido_id: true
      },
      _sum: {
        monto_total: true,
        monto_descuento: true,
        costo_envio: true,
        monto_impuestos: true
      },
      _avg: {
        monto_total: true
      }
    })

    // Ventas por día
    const ventasPorDia = await prisma.pedido.groupBy({
      by: ['fecha_creacion'],
      where: whereClause,
      _sum: {
        monto_total: true
      },
      _count: {
        pedido_id: true
      },
      orderBy: {
        fecha_creacion: 'asc'
      }
    })

    // Productos más vendidos
    const productosMasVendidos = await prisma.itemPedido.groupBy({
      by: ['producto_id'],
      where: {
        pedido: whereClause
      },
      _sum: {
        cantidad: true,
        precio_total: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 10
    })

    res.json({
      estadisticas: {
        totalVentas: estadisticasVentas._sum.monto_total || 0,
        totalPedidos: estadisticasVentas._count.pedido_id || 0,
        promedioPedido: estadisticasVentas._avg.monto_total || 0,
        totalDescuentos: estadisticasVentas._sum.monto_descuento || 0,
        totalEnvio: estadisticasVentas._sum.costo_envio || 0,
        totalImpuestos: estadisticasVentas._sum.monto_impuestos || 0
      },
      ventasPorDia,
      productosMasVendidos
    })

  } catch (error) {
    console.error('Error en reportes de ventas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}