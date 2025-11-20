import { useState } from 'react';
import StockEditor from '../StockEditor';
import TransaccionesModal from './TransaccionesModal';

export default function InventarioTable({ inventario, onUpdateStock, loading }) {
  const [editingId, setEditingId] = useState(null);
  const [showTransacciones, setShowTransacciones] = useState(null);

  const getStockStatus = (item) => {
    if (item.cantidad_disponible === 0) {
      return { text: 'Sin Stock', color: 'text-red-600 bg-red-100' };
    }
    if (item.alerta_stock_bajo) {
      return { text: 'Stock Bajo', color: 'text-yellow-600 bg-yellow-100' };
    }
    return { text: 'En Stock', color: 'text-green-600 bg-green-100' };
  };

  const handleSaveStock = async (inventarioId, cantidad, razon, tipoTransaccion) => {
    await onUpdateStock(inventarioId, cantidad, razon, tipoTransaccion);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando inventario...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Disponible
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Reservado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventario.map((item) => {
              const status = getStockStatus(item);
              return (
                <tr key={item.inventario_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        {item.producto.url_imagen_principal ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={item.producto.url_imagen_principal}
                            alt={item.producto.nombre}
                          />
                        ) : (
                          <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.producto.nombre}
                        </div>
                        {item.variante && (
                          <div className="text-sm text-gray-500">
                            {item.variante.nombre_variante}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.variante ? item.variante.sku : item.producto.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.producto.categoria?.nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item.inventario_id ? (
                      <StockEditor
                        item={item}
                        onSave={(cantidad, razon, tipoTransaccion) => {
                          handleSaveStock(item.inventario_id, cantidad, razon, tipoTransaccion);
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.cantidad_disponible}
                        </span>
                        <button
                          onClick={() => setEditingId(item.inventario_id)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.cantidad_reservada}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setShowTransacciones(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Historial
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showTransacciones && (
        <TransaccionesModal
          item={showTransacciones}
          onClose={() => setShowTransacciones(null)}
        />
      )}
    </div>
  );
}