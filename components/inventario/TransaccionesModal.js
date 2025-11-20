import { useState, useEffect } from 'react';

export default function TransaccionesModal({ item, onClose }) {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarTransacciones = async () => {
      try {
        const response = await fetch(`/api/inventario/${item.inventario_id}/transacciones`);
        if (response.ok) {
          const data = await response.json();
          setTransacciones(data);
        }
      } catch (error) {
        console.error('Error cargando transacciones:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarTransacciones();
  }, [item.inventario_id]);

  const getTipoTransaccionColor = (tipo) => {
    const colores = {
      compra: 'bg-green-100 text-green-800',
      devolucion: 'bg-blue-100 text-blue-800',
      ajuste: 'bg-yellow-100 text-yellow-800',
      danado: 'bg-red-100 text-red-800',
      recibido: 'bg-purple-100 text-purple-800',
      reservado: 'bg-orange-100 text-orange-800',
      liberado: 'bg-indigo-100 text-indigo-800'
    };
    return colores[tipo] || 'bg-gray-100 text-gray-800';
  };

  const formatoFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            Historial de Transacciones - {item.producto.nombre}
            {item.variante && ` (${item.variante.nombre_variante})`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando transacciones...</p>
            </div>
          ) : transacciones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay transacciones registradas para este producto.
            </div>
          ) : (
            <div className="space-y-3">
              {transacciones.map((transaccion) => (
                <div
                  key={transaccion.transaccion_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTipoTransaccionColor(transaccion.tipo_transaccion)}`}>
                        {transaccion.tipo_transaccion}
                      </span>
                      <span className="text-sm text-gray-600">
                        {formatoFecha(transaccion.fecha_creacion)}
                      </span>
                    </div>
                    {transaccion.razon && (
                      <p className="text-sm text-gray-700 mt-1">{transaccion.razon}</p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {transaccion.cantidad_anterior}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className={`text-sm font-medium ${
                        transaccion.cambio_cantidad > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaccion.cantidad_nueva}
                      </span>
                    </div>
                    <div className={`text-xs ${
                      transaccion.cambio_cantidad > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaccion.cambio_cantidad > 0 ? '+' : ''}{transaccion.cambio_cantidad}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}