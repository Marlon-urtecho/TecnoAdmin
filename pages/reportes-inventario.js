import Layout from "@/components/Layout";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function ReportesInventario() {
  const { data: session } = useSession();
  const [reportes, setReportes] = useState({
    stockBajo: [],
    productosAgotados: [],
    movimientosRecientes: [],
    estadisticas: {},
    productosMasVendidos: []
  });
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [rangoFechas, setRangoFechas] = useState({
    inicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fin: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    cargarReportes();
  }, []);

  const cargarReportes = async () => {
    try {
      setLoading(true);
      
      // Cargar todos los reportes en paralelo
      const [
        estadisticasRes,
        stockBajoRes,
        productosAgotadosRes,
        movimientosRes,
        productosVendidosRes
      ] = await Promise.all([
        fetch('/api/reportes/inventario?tipo=estadisticas-generales'),
        fetch('/api/reportes/inventario?tipo=stock-bajo'),
        fetch('/api/reportes/inventario?tipo=productos-agotados'),
        fetch(`/api/reportes/inventario?tipo=movimientos-recientes&fechaInicio=${rangoFechas.inicio}&fechaFin=${rangoFechas.fin}`),
        fetch(`/api/reportes/inventario?tipo=productos-mas-vendidos&fechaInicio=${rangoFechas.inicio}&fechaFin=${rangoFechas.fin}`)
      ]);

      if (!estadisticasRes.ok) throw new Error('Error cargando estadísticas');
      if (!stockBajoRes.ok) throw new Error('Error cargando stock bajo');
      if (!productosAgotadosRes.ok) throw new Error('Error cargando productos agotados');
      if (!movimientosRes.ok) throw new Error('Error cargando movimientos');
      if (!productosVendidosRes.ok) throw new Error('Error cargando productos vendidos');

      const [
        estadisticas,
        stockBajo,
        productosAgotados,
        movimientosRecientes,
        productosMasVendidos
      ] = await Promise.all([
        estadisticasRes.json(),
        stockBajoRes.json(),
        productosAgotadosRes.json(),
        movimientosRes.json(),
        productosVendidosRes.json()
      ]);

      setReportes({
        estadisticas,
        stockBajo,
        productosAgotados,
        movimientosRecientes,
        productosMasVendidos
      });

    } catch (error) {
      console.error('Error cargando reportes:', error);
      alert('Error al cargar los reportes: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getColorStock = (stockActual, stockMinimo) => {
    if (stockActual === 0) return 'red';
    if (stockActual <= stockMinimo) return 'orange';
    return 'green';
  };

  const exportarReporte = async (tipo) => {
    try {
      const response = await fetch(`/api/reportes/inventario?tipo=${tipo}&fechaInicio=${rangoFechas.inicio}&fechaFin=${rangoFechas.fin}`);
      
      if (!response.ok) {
        throw new Error('Error al exportar reporte');
      }

      const data = await response.json();
      
      // Crear y descargar archivo JSON (puedes cambiar esto a CSV/Excel después)
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-${tipo}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Reporte de ${tipo} exportado exitosamente`);
      
    } catch (error) {
      console.error('Error exportando reporte:', error);
      alert('Error al exportar el reporte: ' + error.message);
    }
  };

  const formatFecha = (fechaString) => {
    if (!fechaString) return 'N/A';
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoneda = (monto) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando reportes de inventario...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Reportes de Inventario 📊
          </h1>
          <p className="text-slate-600 text-lg">
            Monitorea el estado de tu inventario en tiempo real
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Selector de rango de fechas */}
          <div className="flex gap-2">
            <input
              type="date"
              value={rangoFechas.inicio}
              onChange={(e) => setRangoFechas(prev => ({ ...prev, inicio: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <input
              type="date"
              value={rangoFechas.fin}
              onChange={(e) => setRangoFechas(prev => ({ ...prev, fin: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => exportarReporte('stock_bajo')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
            >
              <span>📥</span>
              Exportar
            </button>
            <button 
              onClick={() => cargarReportes()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
            >
              <span>🔄</span>
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { 
            title: "Total Productos", 
            value: reportes.estadisticas.totalProductos || 0, 
            color: "blue", 
            icon: "📦",
            desc: "En inventario"
          },
          { 
            title: "Valor Inventario", 
            value: formatMoneda(reportes.estadisticas.valorTotalInventario || 0), 
            color: "green", 
            icon: "💰",
            desc: "Valor total"
          },
          { 
            title: "Stock Bajo", 
            value: reportes.estadisticas.productosStockBajo || 0, 
            color: "orange", 
            icon: "⚠️",
            desc: "Necesitan reposición"
          },
          { 
            title: "Agotados", 
            value: reportes.estadisticas.productosAgotados || 0, 
            color: "red", 
            icon: "❌",
            desc: "Sin stock"
          }
        ].map((stat, index) => (
          <div 
            key={index}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-slate-500 text-xs mt-1">{stat.desc}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Stock Bajo */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              ⚠️ Productos con Stock Bajo
            </h2>
            <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
              {reportes.stockBajo.length} productos
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reportes.stockBajo.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>No hay productos con stock bajo</p>
              </div>
            ) : (
              reportes.stockBajo.map((producto) => (
                <div key={producto.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{producto.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span>SKU: {producto.sku}</span>
                      {producto.precioCosto && (
                        <span>Costo: {formatMoneda(producto.precioCosto)}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      getColorStock(producto.stockActual, producto.stockMinimo) === 'red' ? 'text-red-600' :
                      getColorStock(producto.stockActual, producto.stockMinimo) === 'orange' ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {producto.stockActual} unidades
                    </div>
                    <div className="text-sm text-slate-500">
                      Mínimo: {producto.stockMinimo}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Productos Agotados */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              ❌ Productos Agotados
            </h2>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {reportes.productosAgotados.length} productos
            </span>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reportes.productosAgotados.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>No hay productos agotados</p>
              </div>
            ) : (
              reportes.productosAgotados.map((producto) => (
                <div key={producto.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{producto.nombre}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                      <span>SKU: {producto.sku}</span>
                      {producto.precioCosto && (
                        <span>Costo: {formatMoneda(producto.precioCosto)}</span>
                      )}
                    </div>
                    {producto.ultimoMovimiento && (
                      <div className="text-xs text-slate-500 mt-1">
                        Último movimiento: {formatFecha(producto.ultimoMovimiento)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      Agotado
                    </div>
                    {producto.tipoUltimoMovimiento && (
                      <div className="text-sm text-slate-500 capitalize">
                        {producto.tipoUltimoMovimiento}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Movimientos Recientes */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            📋 Movimientos Recientes
          </h2>
          <select 
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los movimientos</option>
            <option value="compra">Compras</option>
            <option value="venta">Ventas</option>
            <option value="ajuste">Ajustes</option>
            <option value="devolucion">Devoluciones</option>
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Cantidad</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Stock Anterior</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Stock Nuevo</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Fecha</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Usuario</th>
              </tr>
            </thead>
            <tbody>
              {reportes.movimientosRecientes
                .filter(mov => filtro === 'todos' || mov.tipo === filtro)
                .map((movimiento) => (
                <tr key={movimiento.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{movimiento.producto}</div>
                      <div className="text-sm text-slate-500">{movimiento.sku}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      movimiento.tipo === 'compra' || movimiento.tipo === 'entrada' ? 'bg-green-100 text-green-800' :
                      movimiento.tipo === 'venta' || movimiento.tipo === 'salida' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {movimiento.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      movimiento.cambioCantidad > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {movimiento.cambioCantidad > 0 ? '+' : ''}{movimiento.cambioCantidad}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{movimiento.cantidadAnterior}</td>
                  <td className="py-3 px-4 text-slate-600">{movimiento.cantidadNueva}</td>
                  <td className="py-3 px-4 text-slate-600">{formatFecha(movimiento.fecha)}</td>
                  <td className="py-3 px-4 text-slate-600">{movimiento.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportes.movimientosRecientes.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No hay movimientos recientes
            </div>
          )}
        </div>
      </div>

      {/* Productos Más Vendidos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            🏆 Productos Más Vendidos
          </h2>
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {reportes.productosMasVendidos.length} productos
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Producto</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Categoría</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Cantidad Vendida</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Total Vendido</th>
                <th className="text-left py-3 px-4 text-slate-600 font-semibold">Stock Actual</th>
              </tr>
            </thead>
            <tbody>
              {reportes.productosMasVendidos.map((producto, index) => (
                <tr key={producto.producto_id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-slate-900">{producto.nombre}</div>
                      <div className="text-sm text-slate-500">{producto.sku}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{producto.categoria}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-blue-600">
                      {producto.cantidadVendida} unidades
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-green-600">
                    {formatMoneda(producto.totalVendido)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      producto.stockActual === 0 ? 'text-red-600' :
                      producto.stockActual <= 5 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {producto.stockActual} unidades
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reportes.productosMasVendidos.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No hay datos de productos vendidos
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}