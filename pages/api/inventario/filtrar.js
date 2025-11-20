import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "No autorizado" });
  }

  if (req.method === 'POST') {
    try {
      const { search, categoria, marca, stockBajo, sinStock } = req.body;

      // Construir condiciones WHERE
      const whereConditions = {};

      // Filtro de búsqueda por texto
      if (search) {
        whereConditions.OR = [
          {
            producto: {
              nombre: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            producto: {
              sku: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            variante: {
              sku: {
                contains: search,
                mode: 'insensitive'
              }
            }
          },
          {
            variante: {
              nombre_variante: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        ];
      }

      // Filtro por categoría
      if (categoria) {
        whereConditions.producto = {
          ...whereConditions.producto,
          categoria_id: categoria
        };
      }

      // Filtro por marca
      if (marca) {
        whereConditions.producto = {
          ...whereConditions.producto,
          marca_id: marca
        };
      }

      // Filtro por stock bajo
      if (stockBajo) {
        whereConditions.alerta_stock_bajo = true;
        whereConditions.cantidad_disponible = { gt: 0 }; // Excluir productos sin stock
      }

      // Filtro por sin stock
      if (sinStock) {
        whereConditions.cantidad_disponible = 0;
      }

      const inventario = await prisma.inventario.findMany({
        where: whereConditions,
        include: {
          producto: {
            include: {
              categoria: true,
              marca: true,
              variantes: true
            }
          },
          variante: true,
          transacciones: {
            orderBy: {
              fecha_creacion: 'desc'
            },
            take: 5
          }
        },
        orderBy: {
          fecha_actualizacion: 'desc'
        }
      });

      return res.json(inventario);
    } catch (error) {
      console.error('Error filtrando inventario:', error);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}