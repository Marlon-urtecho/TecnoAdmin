import { useState, useEffect } from 'react';

export default function InventarioFilters({ 
  filters, 
  onFilterChange, 
  categorias = [], 
  marcas = [] 
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Debounce para la búsqueda
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onFilterChange(localFilters);
    }, 500); // 500ms de debounce

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [localFilters.search]);

  // Para otros filtros, aplicar inmediatamente
  useEffect(() => {
    if (localFilters.search === filters.search) {
      onFilterChange(localFilters);
    }
  }, [localFilters.categoria, localFilters.marca, localFilters.stockBajo, localFilters.sinStock]);

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      categoria: '',
      marca: '',
      stockBajo: false,
      sinStock: false
    };
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Buscar
          </label>
          <input
            type="text"
            value={localFilters.search}
            onChange={(e) => handleChange('search', e.target.value)}
            placeholder="SKU, nombre, producto..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            value={localFilters.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las categorías</option>
            {Array.isArray(categorias) && categorias.map(categoria => (
              <option key={categoria.categoria_id} value={categoria.categoria_id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Marca
          </label>
          <select
            value={localFilters.marca}
            onChange={(e) => handleChange('marca', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las marcas</option>
            {Array.isArray(marcas) && marcas.map(marca => (
              <option key={marca.marca_id} value={marca.marca_id}>
                {marca.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Checkboxes */}
        <div className="flex flex-col justify-center space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.stockBajo}
              onChange={(e) => handleChange('stockBajo', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Stock Bajo</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.sinStock}
              onChange={(e) => handleChange('sinStock', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Sin Stock</span>
          </label>
        </div>

        {/* Botón de limpiar */}
        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
}