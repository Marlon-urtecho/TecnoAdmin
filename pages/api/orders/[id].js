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

  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET':
        await handleGet(req, res, id);
        break;
      case 'PUT':
        await handlePut(req, res, id);
        break;
      case 'POST':
        await handlePost(req, res, id, session);
        break;
      default:
        res.status(405).json({ error: "Método no permitido" });
    }
  } catch (error) {
    console.error('Error en API orders/[id]:', error);
    res.status(500).json({ 
      error: "Error interno del servidor",
      details: error.message,
      code: error.code
    });
  }
}

// GET - Obtener orden específica
async function handleGet(req, res, id) {
  const order = await prisma.pedido.findUnique({
    where: { pedido_id: id },
    include: {
      usuario: {
        include: {
          perfil_usuario: true
        }
      },
      direccion_facturacion: true,
      direccion_envio: true,
      metodo_envio: true,
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
        orderBy: {
          fecha_creacion: 'desc'
        }
      },
      usos_cupon: {
        include: {
          cupon: true
        }
      }
    }
  });

  if (!order) {
    return res.status(404).json({ error: "Orden no encontrada" });
  }

  res.json(order);
}

// PUT - Actualizar orden
async function handlePut(req, res, id) {
  const { estado, numero_seguimiento, estado_pago } = req.body;

  // Validar que la orden existe
  const existingOrder = await prisma.pedido.findUnique({
    where: { pedido_id: id }
  });

  if (!existingOrder) {
    return res.status(404).json({ error: "Orden no encontrada" });
  }

  const updateData = {
    fecha_actualizacion: new Date()
  };

  // Solo actualizar campos que se envían
  if (estado !== undefined) {
    updateData.estado = estado;
    
    // Actualizaciones automáticas basadas en estado
    if (estado === 'entregado') {
      updateData.estado_fulfillment = 'completado';
    } else if (estado === 'cancelado') {
      updateData.fecha_cancelacion = new Date();
    }
    // Para 'enviado' no hay campo de fecha específico en tu schema
  }

  if (numero_seguimiento !== undefined) {
    updateData.numero_seguimiento = numero_seguimiento;
  }

  if (estado_pago !== undefined) {
    updateData.estado_pago = estado_pago;
    
    if (estado_pago === 'pagado') {
      updateData.fecha_pago = new Date();
    }
  }

  const updatedOrder = await prisma.pedido.update({
    where: { pedido_id: id },
    data: updateData,
    include: {
      usuario: {
        include: {
          perfil_usuario: true
        }
      },
      direccion_facturacion: true,
      direccion_envio: true,
      metodo_envio: true,
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
      }
    }
  });

  res.json(updatedOrder);
}

// POST - Acciones específicas
async function handlePost(req, res, id, session) {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: "Acción no especificada" });
  }

  // Validar que la orden existe
  const existingOrder = await prisma.pedido.findUnique({
    where: { pedido_id: id }
  });

  if (!existingOrder) {
    return res.status(404).json({ error: "Orden no encontrada" });
  }

  const updateData = {
    fecha_actualizacion: new Date()
  };

  switch (action) {
    case 'confirmar_venta':
      updateData.estado = 'confirmado';
      updateData.estado_pago = 'pagado';
      updateData.fecha_pago = new Date();
      
      // Crear pago automáticamente
      try {
        await prisma.pago.create({
          data: {
            pedido_id: id,
            monto: existingOrder.monto_total || 0,
            estado: 'pagado',
            moneda: existingOrder.moneda || 'MXN',
            respuesta_pasarela: { 
              metodo: 'confirmacion_manual',
              admin: session.user.email || 'sistema',
              fecha: new Date().toISOString()
            }
          }
        });
      } catch (paymentError) {
        console.error('Error creando pago:', paymentError);
        // Continuar aunque falle la creación del pago
      }
      break;

    case 'marcar_como_pagado':
      updateData.estado_pago = 'pagado';
      updateData.fecha_pago = new Date();
      
      // Crear pago si no existe
      try {
        const existingPayment = await prisma.pago.findFirst({
          where: { pedido_id: id }
        });
        
        if (!existingPayment) {
          await prisma.pago.create({
            data: {
              pedido_id: id,
              monto: existingOrder.monto_total || 0,
              estado: 'pagado',
              moneda: existingOrder.moneda || 'MXN',
              respuesta_pasarela: { 
                metodo: 'marcado_manual',
                admin: session.user.email || 'sistema',
                fecha: new Date().toISOString()
              }
            }
          });
        }
      } catch (paymentError) {
        console.error('Error creando pago:', paymentError);
      }
      break;

    case 'marcar_como_enviado':
      updateData.estado = 'enviado';
      // No usar fecha_envio ya que no existe en el schema
      break;

    case 'marcar_como_entregado':
      updateData.estado = 'entregado';
      updateData.estado_fulfillment = 'completado';
      // No usar fecha_entrega ya que no existe en el schema
      break;

    case 'cancelar_orden':
      updateData.estado = 'cancelado';
      updateData.fecha_cancelacion = new Date();
      break;

    default:
      return res.status(400).json({ error: "Acción no válida" });
  }

  const updatedOrder = await prisma.pedido.update({
    where: { pedido_id: id },
    data: updateData,
    include: {
      usuario: {
        include: {
          perfil_usuario: true
        }
      },
      direccion_facturacion: true,
      direccion_envio: true,
      metodo_envio: true,
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
        orderBy: {
          fecha_creacion: 'desc'
        }
      }
    }
  });

  res.json({
    success: true,
    order: updatedOrder,
    message: `Orden ${action.replace(/_/g, ' ')} exitosamente`
  });
}