// pages/api/orders.js
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

// Funciones auxiliares para colores de estado
function getEstadoColor(estado) {
  const colors = {
    pendiente: 'orange',
    confirmado: 'blue',
    procesando: 'purple',
    enviado: 'teal',
    entregado: 'green',
    cancelado: 'red',
    reembolsado: 'gray'
  };
  return colors[estado] || 'gray';
}

function getEstadoPagoColor(estadoPago) {
  const colors = {
    pendiente: 'orange',
    procesando: 'blue',
    pagado: 'green',
    fallido: 'red',
    reembolsado: 'gray',
    parcialmente_reembolsado: 'yellow'
  };
  return colors[estadoPago] || 'gray';
}

export default async function handler(req, res) {
  // Verificar autenticación y permisos de admin
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }
  
  // Verificación más robusta:
  const isAdmin = session.user.isAdmin || 
              session.user.es_superusuario || 
              session.user.es_personal || 
              session.user.email === 'urtechoalex065@gmail.com';

  if (!isAdmin) {
        return res.status(403).json({ error: "No autorizado - Se requieren permisos de administrador" });
  }

  // Manejar diferentes métodos HTTP
  if (req.method === 'GET') {
    await handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    await handlePostRequest(req, res);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

// Manejar GET - Obtener todas las órdenes
async function handleGetRequest(req, res) {
  try {
    // Obtener todas las órdenes con información relacionada
    const orders = await prisma.pedido.findMany({
      include: {
        usuario: {
          select: {
            usuario_id: true,
            correo_electronico: true,
            perfil_usuario: {
              select: {
                nombres: true,
                apellidos: true
              }
            }
          }
        },
        direccion_facturacion: {
          select: {
            nombre_destinatario: true,
            ciudad: true,
            codigo_pais: true,
            linea_direccion1: true,
            codigo_postal: true
          }
        },
        direccion_envio: {
          select: {
            nombre_destinatario: true,
            ciudad: true,
            codigo_pais: true,
            linea_direccion1: true,
            codigo_postal: true
          }
        },
        metodo_envio: {
          select: {
            nombre: true,
            precio: true,
            dias_estimados_min: true,
            dias_estimados_max: true
          }
        },
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true,
                url_imagen_principal: true
              }
            },
            variante: {
              select: {
                nombre_variante: true,
                sku: true,
                url_imagen: true
              }
            }
          }
        },
        pagos: {
          select: {
            pago_id: true,
            monto: true,
            estado: true,
            fecha_creacion: true,
            monto_reembolsado: true
          },
          orderBy: {
            fecha_creacion: 'desc'
          }
        },
        usos_cupon: {
          include: {
            cupon: {
              select: {
                codigo: true,
                tipo_descuento: true,
                valor_descuento: true
              }
            }
          }
        },
        _count: {
          select: {
            items: true
          }
        }
      },
      orderBy: {
        fecha_creacion: 'desc'
      }
    });

    // Formatear la respuesta para que sea más fácil de usar en el frontend
    const formattedOrders = orders.map(order => {
      // Calcular información adicional
      const pagoPrincipal = order.pagos[0]; // Tomar el pago más reciente
      const totalPagado = order.pagos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + p.monto, 0);
      
      const totalReembolsado = order.pagos
        .reduce((sum, p) => sum + p.monto_reembolsado, 0);

      return {
        // Información básica de la orden
        pedido_id: order.pedido_id,
        numero_pedido: order.numero_pedido,
        estado: order.estado,
        estado_pago: order.estado_pago,
        estado_fulfillment: order.estado_fulfillment,
        
        // Información del cliente
        info_cliente: {
          email: order.correo_cliente,
          nombre: order.direccion_facturacion?.nombre_destinatario || order.direccion_envio?.nombre_destinatario || 'N/A',
          telefono: order.telefono_cliente,
          usuario_id: order.usuario?.usuario_id,
          nombre_completo: order.usuario?.perfil_usuario ? 
            `${order.usuario.perfil_usuario.nombres} ${order.usuario.perfil_usuario.apellidos}` : null
        },
        
        // Direcciones
        direccion_facturacion: order.direccion_facturacion ? {
          nombre: order.direccion_facturacion.nombre_destinatario,
          direccion: order.direccion_facturacion.linea_direccion1,
          ciudad: order.direccion_facturacion.ciudad,
          codigo_postal: order.direccion_facturacion.codigo_postal,
          pais: order.direccion_facturacion.codigo_pais
        } : null,
        
        direccion_envio: order.direccion_envio ? {
          nombre: order.direccion_envio.nombre_destinatario,
          direccion: order.direccion_envio.linea_direccion1,
          ciudad: order.direccion_envio.ciudad,
          codigo_postal: order.direccion_envio.codigo_postal,
          pais: order.direccion_envio.codigo_pais
        } : null,
        
        // Método de envío
        metodo_envio: order.metodo_envio ? {
          nombre: order.metodo_envio.nombre,
          precio: order.metodo_envio.precio,
          tiempo_estimado: order.metodo_envio.dias_estimados_min && order.metodo_envio.dias_estimados_max ?
            `${order.metodo_envio.dias_estimados_min}-${order.metodo_envio.dias_estimados_max} días` : null
        } : null,
        
        // Información financiera
        montos: {
          subtotal: order.subtotal_items,
          envio: order.costo_envio,
          impuestos: order.monto_impuestos,
          descuento: order.monto_descuento,
          total: order.monto_total,
          total_pagado: totalPagado,
          total_reembolsado: totalReembolsado
        },
        
        // Items del pedido
        items: order.items.map(item => ({
          item_pedido_id: item.item_pedido_id,
          producto: {
            nombre: item.nombre_producto,
            sku: item.sku_producto,
            imagen: item.variante?.url_imagen || item.producto?.url_imagen_principal
          },
          variante: item.variante ? {
            nombre: item.variante.nombre_variante,
            sku: item.variante.sku
          } : null,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          precio_total: item.precio_total,
          atributos: item.atributos_variante
        })),
        
        // Pagos
        pagos: order.pagos.map(pago => ({
          pago_id: pago.pago_id,
          monto: pago.monto,
          estado: pago.estado,
          monto_reembolsado: pago.monto_reembolsado,
          fecha: pago.fecha_creacion
        })),
        
        // Cupones y descuentos
        descuentos: order.usos_cupon.map(uso => ({
          codigo: uso.cupon.codigo,
          tipo: uso.cupon.tipo_descuento,
          valor_descuento: uso.cupon.valor_descuento,
          monto_aplicado: uso.monto_descuento
        })),
        
        // Información de conteo
        total_productos: order._count.items,
        total_items: order.items.reduce((sum, item) => sum + item.cantidad, 0),
        
        // Fechas formateadas
        fechas: {
          creacion: order.fecha_creacion,
          creacion_formatted: order.fecha_creacion.toISOString().split('T')[0],
          pago: order.fecha_pago,
          pago_formatted: order.fecha_pago ? order.fecha_pago.toISOString().split('T')[0] : null,
          fulfillment: order.fecha_fulfillment,
          entrega_estimada: order.fecha_entrega_estimada,
          cancelacion: order.fecha_cancelacion
        },
        
        // Información de seguimiento
        seguimiento: {
          numero_seguimiento: order.numero_seguimiento,
          moneda: order.moneda
        },
        
        // Información adicional para UI
        ui: {
          estado_color: getEstadoColor(order.estado),
          estado_pago_color: getEstadoPagoColor(order.estado_pago),
          puede_editar: ['pendiente', 'confirmado'].includes(order.estado),
          puede_cancelar: ['pendiente', 'confirmado', 'procesando'].includes(order.estado)
        }
      };
    });

    res.json(formattedOrders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: error.message || 'Error interno del servidor' 
    });
  }
}

// Manejar POST - Crear nueva orden
async function handlePostRequest(req, res) {
  try {
    const {
      correo_cliente,
      telefono_cliente,
      nombre_destinatario,
      linea_direccion1,
      linea_direccion2,
      ciudad,
      estado_provincia,
      codigo_postal,
      codigo_pais,
      productos,
      monto_descuento = 0,
      subtotal_items,
      monto_total
    } = req.body;

    // Validaciones básicas
    if (!correo_cliente || !nombre_destinatario || !linea_direccion1 || !ciudad || !codigo_postal) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }

    // Validar productos
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe agregar al menos un producto" });
    }

    // Generar número de orden único
    const numero_pedido = 'ORD-' + Date.now();

    // Crear dirección de envío
    const direccionEnvio = await prisma.direccion.create({
      data: {
        usuario_id: 'temp-user-id', // Necesitarás manejar esto mejor
        tipo_direccion: 'envio',
        nombre_destinatario,
        linea_direccion1,
        linea_direccion2: linea_direccion2 || '',
        ciudad,
        estado_provincia: estado_provincia || '',
        codigo_postal,
        codigo_pais
      }
    });

    // Crear la orden
    const order = await prisma.pedido.create({
      data: {
        numero_pedido,
        correo_cliente,
        telefono_cliente: telefono_cliente || '',
        direccion_facturacion_id: direccionEnvio.direccion_id,
        direccion_envio_id: direccionEnvio.direccion_id,
        subtotal_items: subtotal_items || 0,
        costo_envio: 0,
        monto_impuestos: 0,
        monto_descuento: monto_descuento || 0,
        monto_total: monto_total || 0,
        usuario_id: null, // O el ID del usuario si está registrado
        estado: 'pendiente',
        estado_pago: 'pendiente',
        estado_fulfillment: 'no_completado'
      },
      include: {
        items: true,
        direccion_envio: true,
        direccion_facturacion: true
      }
    });

    // Crear items de la orden
    for (const producto of productos) {
      if (producto.producto_id && producto.cantidad > 0) {
        // Obtener información del producto desde la base de datos
        const productInfo = await prisma.producto.findUnique({
          where: { producto_id: producto.producto_id },
          select: { nombre: true, sku: true }
        });

        await prisma.itemPedido.create({
          data: {
            pedido_id: order.pedido_id,
            producto_id: producto.producto_id,
            variante_id: producto.variante_id || null,
            nombre_producto: productInfo?.nombre || 'Producto',
            sku_producto: productInfo?.sku || 'SKU',
            cantidad: producto.cantidad,
            precio_unitario: producto.precio_unitario,
            precio_total: producto.cantidad * producto.precio_unitario,
            atributos_variante: producto.atributos || {}
          }
        });
      }
    }

    // Obtener la orden completa con todos los datos
    const completeOrder = await prisma.pedido.findUnique({
      where: { pedido_id: order.pedido_id },
      include: {
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true,
                url_imagen_principal: true
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
        direccion_envio: true,
        direccion_facturacion: true
      }
    });

    res.status(201).json({
      success: true,
      order: completeOrder,
      message: 'Orden creada exitosamente'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}