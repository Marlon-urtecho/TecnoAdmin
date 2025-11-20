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

  if (req.method === 'POST') {
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
        metodo_envio_id,
        monto_descuento = 0,
        instrucciones_especiales,
        subtotal_items,
        monto_total
      } = req.body;

      // Generar número de orden único
      const numero_pedido = 'ORD-' + Date.now();

      // Crear dirección de envío
      const direccionEnvio = await prisma.direccion.create({
        data: {
          usuario_id: session.user.id, // O el ID del usuario si está registrado
          tipo_direccion: 'envio',
          nombre_destinatario,
          linea_direccion1,
          linea_direccion2,
          ciudad,
          estado_provincia,
          codigo_postal,
          codigo_pais
        }
      });

      // Crear la orden
      const order = await prisma.pedido.create({
        data: {
          numero_pedido,
          correo_cliente,
          telefono_cliente,
          direccion_facturacion_id: direccionEnvio.direccion_id,
          direccion_envio_id: direccionEnvio.direccion_id,
          subtotal_items: subtotal_items || 0,
          costo_envio: 0, // Puedes calcular esto basado en el método de envío
          monto_impuestos: 0, // Puedes calcular impuestos
          monto_descuento,
          monto_total,
          metodo_envio_id: metodo_envio_id || null,
          usuario_id: session.user.id // O null si es un cliente no registrado
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
          await prisma.itemPedido.create({
            data: {
              pedido_id: order.pedido_id,
              producto_id: producto.producto_id,
              variante_id: producto.variante_id || null,
              nombre_producto: 'Producto', // Deberías obtener el nombre real de la BD
              sku_producto: 'SKU', // Deberías obtener el SKU real de la BD
              cantidad: producto.cantidad,
              precio_unitario: producto.precio_unitario,
              precio_total: producto.cantidad * producto.precio_unitario
            }
          });
        }
      }

      res.json({
        success: true,
        order,
        message: 'Orden creada exitosamente'
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: "Error interno del servidor",
        details: error.message 
      });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}