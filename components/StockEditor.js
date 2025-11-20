import { useState } from 'react';

export default function StockEditor({ item, onSave, onCancel }) {
  const [cantidad, setCantidad] = useState(item.cantidad_disponible);
  const [razon, setRazon] = useState('');
  const [tipoTransaccion, setTipoTransaccion] = useState('ajuste');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(cantidad, razon, tipoTransaccion);
    } catch (error) {
      console.error('Error guardando stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiposTransaccion = [
    { value: 'ajuste', label: 'Ajuste Manual' },
    { value: 'compra', label: 'Compra' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'recibido', label: 'Mercancía Recibida' },
    { value: 'danado', label: 'Dañado/Perdido' }
  ];

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <div className="flex-1">
        <input
          type="number"
          value={cantidad}
          onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
          min="0"
          required
        />
      </div>
      
      <div className="flex-1">
        <select
          value={tipoTransaccion}
          onChange={(e) => setTipoTransaccion(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        >
          {tiposTransaccion.map(tipo => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <input
          type="text"
          value={razon}
          onChange={(e) => setRazon(e.target.value)}
          placeholder="Razón del ajuste"
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
        />
      </div>

      <div className="flex space-x-1">
        <button
          type="submit"
          disabled={loading}
          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '...' : '✓'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
        >
          ✕
        </button>
      </div>
    </form>
  );
}