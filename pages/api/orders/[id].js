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

  if (req.method === 'GET') {
    try {
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
              producto: true,
              variante: true
            }
          },
          pagos: true,
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
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  } else if (req.method === 'PUT') {
    try {
      const { estado, numero_seguimiento } = req.body;

      const updatedOrder = await prisma.pedido.update({
        where: { pedido_id: id },
        data: {
          ...(estado && { estado }),
          ...(numero_seguimiento && { numero_seguimiento }),
          fecha_actualizacion: new Date()
        }
      });

      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order:', error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  } else {
    res.status(405).json({ error: "Método no permitido" });
  }
}