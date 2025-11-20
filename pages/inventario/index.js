// pages/inventario/index.js
import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/Layout';
import InventarioTable from '@/components/inventario/InventarioTable';
import InventarioFilters from '@/components/inventario/InventarioFilters';
import InventarioStats from '@/components/inventario/InventarioStats';

export default function InventarioPage({ initialInventario, stats, categorias, marcas }) {
  const [inventario, setInventario] = useState(initialInventario);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    marca: '',
    stockBajo: false,
    sinStock: false
  });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = async (newFilters) => {
    setFilters(newFilters);
    setLoading(true);

    try {
      const response = await fetch('/api/inventario/filtrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFilters),
      });

      if (response.ok) {
        const filteredInventario = await response.json();
        setInventario(filteredInventario);
      } else {
        console.error('Error filtrando inventario');
      }
    } catch (error) {
      console.error('Error en filtrado:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (inventarioId, nuevaCantidad, razon, tipoTransaccion) => {
    try {
      const response = await fetch(`/api/inventario/${inventarioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          cantidad: nuevaCantidad,
          razon: razon,
          tipoTransaccion: tipoTransaccion
        }),
      });

      if (response.ok) {
        const inventarioActualizado = await response.json();
        
        // Actualizar el estado local
        setInventario(prev => prev.map(item => 
          item.inventario_id === inventarioId 
            ? { 
                ...item, 
                cantidad_disponible: nuevaCantidad,
                cantidad_stock: nuevaCantidad,
                alerta_stock_bajo: nuevaCantidad <= item.producto.umbral_stock_bajo,
                fecha_actualizacion: new Date().toISOString()
              }
            : item
        ));

        // Recargar estadísticas si es necesario
        await recargarEstadisticas();
      }
    } catch (error) {
      console.error('Error actualizando stock:', error);
    }
  };

  const recargarEstadisticas = async () => {
    // Podrías implementar una recarga de estadísticas si es necesario
    // o simplemente recalcularlas localmente
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600">Administra y controla tu stock de productos</p>
        </div>

        {/* Estadísticas */}
        <InventarioStats stats={stats} />

        {/* Filtros */}
        <InventarioFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          categorias={categorias}
          marcas={marcas}
        />

        {/* Tabla de inventario */}
        <InventarioTable 
          inventario={inventario}
          onUpdateStock={handleUpdateStock}
          loading={loading}
        />
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const inventario = await prisma.inventario.findMany({
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

    // Obtener categorías para los filtros
    const categorias = await prisma.categoria.findMany({
      where: { esta_activa: true },
      select: { categoria_id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    });

    // Obtener marcas para los filtros
    const marcas = await prisma.marca.findMany({
      where: { esta_activa: true },
      select: { marca_id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    });

    // Calcular estadísticas
    const totalProductos = await prisma.producto.count({
      where: { esta_activo: true }
    });
    
    const productosSinStock = await prisma.inventario.count({
      where: { 
        cantidad_disponible: 0,
        producto: { esta_activo: true }
      }
    });
    
    const productosStockBajo = await prisma.inventario.count({
      where: { 
        AND: [
          { cantidad_disponible: { gt: 0 } },
          { alerta_stock_bajo: true },
          { producto: { esta_activo: true } }
        ]
      }
    });

    const valorTotalInventario = await prisma.$queryRaw`
      SELECT SUM(i.cantidad_disponible * COALESCE(p.precio_costo, 0)) as valor_total
      FROM inventario i
      INNER JOIN producto p ON i.producto_id = p.producto_id
      WHERE p.esta_activo = true
    `;

    const stats = {
      totalProductos,
      productosSinStock,
      productosStockBajo,
      valorTotal: valorTotalInventario[0]?.valor_total || 0
    };

    return {
      props: {
        initialInventario: JSON.parse(JSON.stringify(inventario)),
        stats,
        categorias: JSON.parse(JSON.stringify(categorias)),
        marcas: JSON.parse(JSON.stringify(marcas))
      }
    };
  } catch (error) {
    console.error('Error cargando inventario:', error);
    return {
      props: {
        initialInventario: [],
        stats: {},
        categorias: [],
        marcas: []
      }
    };
  }
}