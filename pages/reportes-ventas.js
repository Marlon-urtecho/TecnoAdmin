import Layout from "@/components/Layout";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ReportesVentas() {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    tipoReporte: 'resumen'
  });

  useEffect(() => {
    cargarReporte();
  }, [filtros]);

  const cargarReporte = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('fechaInicio', filtros.fechaInicio);
      params.append('fechaFin', filtros.fechaFin);
      params.append('tipo', filtros.tipoReporte);

      const response = await axios.get(`/api/ventas/reportes?${params}`);
      setReporte(response.data);
    } catch (error) {
      console.error('Error cargando reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = (formato = 'json') => {
    const dataStr = JSON.stringify(reporte, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte-ventas-${filtros.tipoReporte}-${new Date().toISOString().split('T')[0]}.${formato}`;
    link.click();
    URL.revokeObjectURL(url);
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Generando reporte...</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reportes de Ventas</h1>
              <p className="text-gray-600">Análisis detallado del desempeño de ventas</p>
            </div>
            <button
              onClick={() => exportarReporte()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Exportar Reporte
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                value={filtros.fechaInicio}
                onChange={(e) => setFiltros({...filtros, fechaInicio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                value={filtros.fechaFin}
                onChange={(e) => setFiltros({...filtros, fechaFin: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
              <select
                value={filtros.tipoReporte}
                onChange={(e) => setFiltros({...filtros, tipoReporte: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="resumen">Resumen General</option>
                <option value="productos">Productos Más Vendidos</option>
                <option value="clientes">Análisis de Clientes</option>
                <option value="tendencias">Tendencias Temporales</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido del Reporte */}
        {reporte && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">
              Reporte de {filtros.tipoReporte.charAt(0).toUpperCase() + filtros.tipoReporte.slice(1)}
            </h2>

            {filtros.tipoReporte === 'resumen' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Ventas Totales</div>
                  <div className="text-2xl font-bold text-blue-700">{reporte.totalVentas}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Ingresos Totales</div>
                  <div className="text-2xl font-bold text-green-700">{formatMoneda(reporte.ingresosTotales)}</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Productos Vendidos</div>
                  <div className="text-2xl font-bold text-purple-700">{reporte.totalProductosVendidos}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">Ticket Promedio</div>
                  <div className="text-2xl font-bold text-orange-700">{formatMoneda(reporte.ingresosPromedio)}</div>
                </div>
              </div>
            )}

            {/* Aquí puedes agregar más visualizaciones específicas para cada tipo de reporte */}
            <div className="mt-6">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(reporte, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}