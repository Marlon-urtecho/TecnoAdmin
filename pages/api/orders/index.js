import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

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
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: "No autenticado" });
  }

  const isAdmin = session.user.isAdmin || 
                  session.user.es_superusuario || 
                  session.user.es_personal || 
                  session.user.email === 'urtechoalex065@gmail.com';

  if (!isAdmin) {
    return res.status(403).json({ error: "No autorizado - Se requieren permisos de administrador" });
  }

  if (req.method === 'GET') {
    await handleGetRequest(req, res);
  } else if (req.method === 'POST') {
    await handlePostRequest(req, res, session);
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
}

// Manejar GET - Obtener todas las órdenes
async function handleGetRequest(req, res) {
  try {
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
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true,
                url_imagen_principal: true
              }
            }
          }
        },
        pagos: {
          select: {
            pago_id: true,
            monto: true,
            estado: true,
            fecha_creacion: true
          },
          orderBy: {
            fecha_creacion: 'desc'
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

    // Formatear respuesta simplificada para la lista
    const formattedOrders = orders.map(order => {
      const totalPagado = order.pagos
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + p.monto, 0);

      return {
        pedido_id: order.pedido_id,
        numero_pedido: order.numero_pedido,
        estado: order.estado,
        estado_pago: order.estado_pago,
        correo_cliente: order.correo_cliente,
        telefono_cliente: order.telefono_cliente,
        fecha_creacion: order.fecha_creacion,
        monto_total: order.monto_total,
        items: order.items.map(item => ({
          nombre_producto: item.nombre_producto,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario
        })),
        total_productos: order._count.items,
        total_items: order.items.reduce((sum, item) => sum + item.cantidad, 0),
        total_pagado: totalPagado,
        ui: {
          estado_color: getEstadoColor(order.estado),
          estado_pago_color: getEstadoPagoColor(order.estado_pago)
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
async function handlePostRequest(req, res, session) {
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

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: "Debe agregar al menos un producto" });
    }

    // Generar número de orden único
    const numero_pedido = 'ORD-' + Date.now();

    // Buscar usuario existente o usar null
    let usuarioId = null;
    try {
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { correo_electronico: correo_cliente }
      });
      if (usuarioExistente) {
        usuarioId = usuarioExistente.usuario_id;
      }
    } catch (userError) {
      console.error('Error buscando usuario:', userError);
    }

    // Usar transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear dirección de envío
      const direccionEnvio = await tx.direccion.create({
        data: {
          usuario_id: usuarioId,
          tipo_direccion: 'envio',
          es_principal: true,
          nombre_destinatario,
          linea_direccion1,
          linea_direccion2: linea_direccion2 || '',
          ciudad,
          estado_provincia: estado_provincia || '',
          codigo_postal,
          codigo_pais: codigo_pais || 'MX',
          numero_telefono: telefono_cliente || ''
        }
      });

      // Crear la orden
      const order = await tx.pedido.create({
        data: {
          numero_pedido,
          correo_cliente,
          telefono_cliente: telefono_cliente || '',
          direccion_facturacion_id: direccionEnvio.direccion_id,
          direccion_envio_id: direccionEnvio.direccion_id,
          subtotal_items: parseFloat(subtotal_items) || 0,
          costo_envio: 0,
          monto_impuestos: 0,
          monto_descuento: parseFloat(monto_descuento) || 0,
          monto_total: parseFloat(monto_total) || 0,
          usuario_id: usuarioId,
          estado: 'pendiente',
          estado_pago: 'pendiente',
          estado_fulfillment: 'no_completado',
          moneda: 'MXN'
        }
      });

      // Crear items de la orden
      for (const producto of productos) {
        if (producto.producto_id && producto.cantidad > 0) {
          const productInfo = await tx.producto.findUnique({
            where: { producto_id: producto.producto_id },
            select: { nombre: true, sku: true }
          });

          await tx.itemPedido.create({
            data: {
              pedido_id: order.pedido_id,
              producto_id: producto.producto_id,
              variante_id: producto.variante_id || null,
              nombre_producto: productInfo?.nombre || producto.nombre_producto || 'Producto',
              sku_producto: productInfo?.sku || producto.sku_producto || 'SKU',
              cantidad: parseInt(producto.cantidad),
              precio_unitario: parseFloat(producto.precio_unitario),
              precio_total: parseFloat(producto.cantidad) * parseFloat(producto.precio_unitario),
              atributos_variante: producto.atributos || {}
            }
          });
        }
      }

      return order.pedido_id;
    });

    // Obtener la orden completa
    const completeOrder = await prisma.pedido.findUnique({
      where: { pedido_id: result },
      include: {
        items: {
          include: {
            producto: {
              select: {
                nombre: true,
                sku: true,
                url_imagen_principal: true
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
    
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: "Error de duplicación",
        details: "El número de pedido ya existe" 
      });
    }
    
    if (error.code === 'P2003') {
      return res.status(400).json({ 
        error: "Error de referencia",
        details: "Referencia a registro inexistente" 
      });
    }
    
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message 
    });
  }
}