// pages/api/inventario/[id]/transacciones.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const transacciones = await prisma.transaccionInventario.findMany({
        where: { inventario_id: id },
        include: {
          usuario: {
            select: {
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
        take: 50 // Limitar a las últimas 50 transacciones
      });

      return res.json(transacciones);
    } catch (error) {
      console.error('Error cargando transacciones:', error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}