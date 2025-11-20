// pages/api/inventario/[id].js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { cantidad, razon, tipoTransaccion } = req.body;

      // Obtener inventario actual
      const inventarioActual = await prisma.inventario.findUnique({
        where: { inventario_id: id },
        include: { 
          producto: true,
          variante: true 
        }
      });

      if (!inventarioActual) {
        return res.status(404).json({ error: "Inventario no encontrado" });
      }

      // Calcular nueva cantidad
      const cantidadAnterior = inventarioActual.cantidad_disponible;
      const cambioCantidad = cantidad - cantidadAnterior;

      // Actualizar inventario
      const inventarioActualizado = await prisma.inventario.update({
        where: { inventario_id: id },
        data: {
          cantidad_stock: cantidad,
          cantidad_disponible: cantidad - inventarioActual.cantidad_reservada,
          fecha_actualizacion: new Date(),
          alerta_stock_bajo: cantidad <= inventarioActual.producto.umbral_stock_bajo
        },
        include: {
          producto: {
            include: {
              categoria: true,
              marca: true
            }
          },
          variante: true
        }
      });

      // Crear transacción
      await prisma.transaccionInventario.create({
        data: {
          inventario_id: id,
          tipo_transaccion: tipoTransaccion || 'ajuste',
          cambio_cantidad: cambioCantidad,
          cantidad_anterior: cantidadAnterior,
          cantidad_nueva: cantidad,
          razon: razon || 'Ajuste manual de stock',
          creado_por: session.user.id
        }
      });

      return res.json(inventarioActualizado);
    } catch (error) {
      console.error('Error actualizando inventario:', error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}