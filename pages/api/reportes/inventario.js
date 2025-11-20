import { getServerSession } from "next-auth/next"
import { prisma } from "@/lib/prisma"
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  
  if (!session) {
    return res.status(401).json({ error: "No autenticado" })
  }

  // Verificar permisos de admin
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
    const { tipo, fechaInicio, fechaFin } = req.query

    switch (tipo) {
      case 'estadisticas-generales':
        return await getEstadisticasGenerales(req, res)
      case 'stock-bajo':
        return await getStockBajo(req, res)
      case 'productos-agotados':
        return await getProductosAgotados(req, res)
      case 'movimientos-recientes':
        return await getMovimientosRecientes(req, res, fechaInicio, fechaFin)
      case 'rotacion-inventario':
        return await getRotacionInventario(req, res, fechaInicio, fechaFin)
      case 'productos-mas-vendidos':
        return await getProductosMasVendidos(req, res, fechaInicio, fechaFin)
      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido' })
    }
  } catch (error) {
    console.error('Error en reportes de inventario:', error)
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// 1. Estadísticas Generales
async function getEstadisticasGenerales(req, res) {
  try {
    // Total de productos activos
    const totalProductos = await prisma.producto.count({
      where: { esta_activo: true }
    })

    // Productos con stock bajo (cantidad_disponible <= umbral_stock_bajo)
    const productosStockBajo = await prisma.inventario.count({
      where: {
        cantidad_disponible: {
          lte: prisma.inventario.fields.umbral_stock_bajo
        },
        producto: {
          esta_activo: true,
          controlar_inventario: true
        }
      }
    })

    // Productos agotados
    const productosAgotados = await prisma.inventario.count({
      where: {
        cantidad_disponible: 0,
        producto: {
          esta_activo: true,
          controlar_inventario: true
        }
      }
    })

    // Valor total del inventario (precio_costo * cantidad_disponible)
    const inventarioConPrecio = await prisma.inventario.findMany({
      where: {
        producto: {
          esta_activo: true
        }
      },
      include: {
        producto: {
          select: {
            precio_costo: true
          }
        }
      }
    })

    const valorTotalInventario = inventarioConPrecio.reduce((total, item) => {
      const precioCosto = item.producto.precio_costo || 0
      return total + (precioCosto * item.cantidad_disponible)
    }, 0)

    // Rotación mensual (simplificada - ventas del último mes / inventario promedio)
    const fechaUnMesAtras = new Date()
    fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1)

    const ventasUltimoMes = await prisma.itemPedido.aggregate({
      where: {
        pedido: {
          fecha_creacion: {
            gte: fechaUnMesAtras
          },
          estado: {
            in: ['entregado', 'enviado', 'procesando']
          }
        }
      },
      _sum: {
        cantidad: true
      }
    })

    const inventarioPromedio = await prisma.inventario.aggregate({
      where: {
        producto: {
          esta_activo: true
        }
      },
      _avg: {
        cantidad_disponible: true
      }
    })

    const rotacionMensual = inventarioPromedio._avg.cantidad_disponible > 0 
      ? (ventasUltimoMes._sum.cantidad || 0) / inventarioPromedio._avg.cantidad_disponible
      : 0

    res.json({
      totalProductos,
      productosStockBajo,
      productosAgotados,
      valorTotalInventario: Math.round(valorTotalInventario * 100) / 100,
      rotacionMensual: Math.round(rotacionMensual * 100) / 100,
      ventasUltimoMes: ventasUltimoMes._sum.cantidad || 0
    })

  } catch (error) {
    console.error('Error en estadísticas generales:', error)
    throw error
  }
}

// 2. Productos con Stock Bajo
async function getStockBajo(req, res) {
  try {
    const productosStockBajo = await prisma.inventario.findMany({
      where: {
        cantidad_disponible: {
          lte: prisma.inventario.fields.umbral_stock_bajo
        },
        producto: {
          esta_activo: true,
          controlar_inventario: true
        }
      },
      include: {
        producto: {
          select: {
            nombre: true,
            sku: true,
            umbral_stock_bajo: true,
            precio_costo: true
          }
        },
        variante: {
          select: {
            nombre_variante: true,
            sku: true
          }
        }
      },
      orderBy: {
        cantidad_disponible: 'asc'
      }
    })

    const resultado = productosStockBajo.map(item => ({
      id: item.inventario_id,
      nombre: item.variante 
        ? `${item.producto.nombre} - ${item.variante.nombre_variante}`
        : item.producto.nombre,
      sku: item.variante?.sku || item.producto.sku,
      stockActual: item.cantidad_disponible,
      stockMinimo: item.producto.umbral_stock_bajo,
      precioCosto: item.producto.precio_costo,
      necesitaReposicion: item.cantidad_disponible <= item.producto.umbral_stock_bajo
    }))

    res.json(resultado)

  } catch (error) {
    console.error('Error en stock bajo:', error)
    throw error
  }
}

// 3. Productos Agotados
async function getProductosAgotados(req, res) {
  try {
    const productosAgotados = await prisma.inventario.findMany({
      where: {
        cantidad_disponible: 0,
        producto: {
          esta_activo: true,
          controlar_inventario: true
        }
      },
      include: {
        producto: {
          select: {
            nombre: true,
            sku: true,
            precio_costo: true
          }
        },
        variante: {
          select: {
            nombre_variante: true,
            sku: true
          }
        }
      },
      orderBy: {
        fecha_actualizacion: 'desc'
      }
    })

    // Obtener última transacción para cada producto agotado
    const resultado = await Promise.all(
      productosAgotados.map(async (item) => {
        const ultimaTransaccion = await prisma.transaccionInventario.findFirst({
          where: {
            inventario_id: item.inventario_id
          },
          orderBy: {
            fecha_creacion: 'desc'
          },
          select: {
            fecha_creacion: true,
            tipo_transaccion: true
          }
        })

        return {
          id: item.inventario_id,
          nombre: item.variante 
            ? `${item.producto.nombre} - ${item.variante.nombre_variante}`
            : item.producto.nombre,
          sku: item.variante?.sku || item.producto.sku,
          stockActual: 0,
          precioCosto: item.producto.precio_costo,
          ultimoMovimiento: ultimaTransaccion?.fecha_creacion || item.fecha_actualizacion,
          tipoUltimoMovimiento: ultimaTransaccion?.tipo_transaccion
        }
      })
    )

    res.json(resultado)

  } catch (error) {
    console.error('Error en productos agotados:', error)
    throw error
  }
}

// 4. Movimientos Recientes de Inventario
async function getMovimientosRecientes(req, res, fechaInicio, fechaFin) {
  try {
    const whereClause = {
      fecha_creacion: {
        gte: fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días por defecto
        lte: fechaFin ? new Date(fechaFin) : new Date()
      }
    }

    const movimientos = await prisma.transaccionInventario.findMany({
      where: whereClause,
      include: {
        inventario: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true
              }
            },
            variante: {
              select: {
                nombre_variante: true,
                sku: true
              }
            }
          }
        },
        usuario: {
          select: {
            correo_electronico: true,
            perfil_usuario: {
              select: {
                nombres: true,
                apellidos: true
              }
            }
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      },
      take: 100 // Limitar a 100 movimientos recientes
    })

    const resultado = movimientos.map(mov => ({
      id: mov.transaccion_id,
      producto: mov.inventario.variante 
        ? `${mov.inventario.producto.nombre} - ${mov.inventario.variante.nombre_variante}`
        : mov.inventario.producto.nombre,
      sku: mov.inventario.variante?.sku || mov.inventario.producto.sku,
      tipo: mov.tipo_transaccion,
      cambioCantidad: mov.cambio_cantidad,
      cantidadAnterior: mov.cantidad_anterior,
      cantidadNueva: mov.cantidad_nueva,
      fecha: mov.fecha_creacion,
      usuario: mov.usuario?.perfil_usuario 
        ? `${mov.usuario.perfil_usuario.nombres} ${mov.usuario.perfil_usuario.apellidos}`
        : mov.usuario?.correo_electronico || 'Sistema',
      razon: mov.razon,
      tipoReferencia: mov.tipo_referencia,
      referenciaId: mov.referencia_id
    }))

    res.json(resultado)

  } catch (error) {
    console.error('Error en movimientos recientes:', error)
    throw error
  }
}

// 5. Rotación de Inventario (Ventas por período)
async function getRotacionInventario(req, res, fechaInicio, fechaFin) {
  try {
    const whereClause = {
      fecha_creacion: {
        gte: fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Últimos 90 días por defecto
        lte: fechaFin ? new Date(fechaFin) : new Date()
      },
      estado: {
        in: ['entregado', 'enviado', 'procesando']
      }
    }

    // Ventas agrupadas por semana
    const ventasPorSemana = await prisma.pedido.groupBy({
      by: ['fecha_creacion'],
      where: whereClause,
      _sum: {
        monto_total: true
      },
      _count: {
        pedido_id: true
      }
    })

    // Productos más vendidos en el período
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

    // Obtener nombres de productos
    const productosInfo = await prisma.producto.findMany({
      where: {
        producto_id: {
          in: productosMasVendidos.map(p => p.producto_id)
        }
      },
      select: {
        producto_id: true,
        nombre: true,
        sku: true
      }
    })

    const productosConNombres = productosMasVendidos.map(venta => {
      const productoInfo = productosInfo.find(p => p.producto_id === venta.producto_id)
      return {
        producto_id: venta.producto_id,
        nombre: productoInfo?.nombre || 'Producto no encontrado',
        sku: productoInfo?.sku || 'N/A',
        cantidadVendida: venta._sum.cantidad || 0,
        totalVendido: venta._sum.precio_total || 0
      }
    })

    res.json({
      ventasPorSemana: ventasPorSemana.map(v => ({
        fecha: v.fecha_creacion,
        totalVentas: v._sum.monto_total || 0,
        cantidadPedidos: v._count.pedido_id
      })),
      productosMasVendidos: productosConNombres
    })

  } catch (error) {
    console.error('Error en rotación de inventario:', error)
    throw error
  }
}

// 6. Productos Más Vendidos
async function getProductosMasVendidos(req, res, fechaInicio, fechaFin) {
  try {
    const whereClause = {
      fecha_creacion: {
        gte: fechaInicio ? new Date(fechaInicio) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Últimos 30 días por defecto
        lte: fechaFin ? new Date(fechaFin) : new Date()
      },
      estado: {
        in: ['entregado', 'enviado', 'procesando']
      }
    }

    const productosVendidos = await prisma.itemPedido.groupBy({
      by: ['producto_id'],
      where: {
        pedido: whereClause
      },
      _sum: {
        cantidad: true,
        precio_total: true
      },
      _avg: {
        precio_unitario: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 20
    })

    // Obtener información completa de productos
    const productosIds = productosVendidos.map(p => p.producto_id)
    const productosInfo = await prisma.producto.findMany({
      where: {
        producto_id: {
          in: productosIds
        }
      },
      include: {
        marca: {
          select: {
            nombre: true
          }
        },
        categoria: {
          select: {
            nombre: true
          }
        },
        inventarios: {
          select: {
            cantidad_disponible: true
          }
        }
      }
    })

    const resultado = productosVendidos.map(venta => {
      const productoInfo = productosInfo.find(p => p.producto_id === venta.producto_id)
      const stockActual = productoInfo?.inventarios[0]?.cantidad_disponible || 0

      return {
        producto_id: venta.producto_id,
        nombre: productoInfo?.nombre || 'Producto no encontrado',
        sku: productoInfo?.sku || 'N/A',
        marca: productoInfo?.marca?.nombre || 'Sin marca',
        categoria: productoInfo?.categoria?.nombre || 'Sin categoría',
        cantidadVendida: venta._sum.cantidad || 0,
        totalVendido: venta._sum.precio_total || 0,
        precioPromedio: venta._avg.precio_unitario || 0,
        stockActual: stockActual,
        url_imagen_principal: productoInfo?.url_imagen_principal
      }
    })

    res.json(resultado)

  } catch (error) {
    console.error('Error en productos más vendidos:', error)
    throw error
  }
}