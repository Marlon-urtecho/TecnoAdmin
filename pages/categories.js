import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import { withSwal } from 'react-sweetalert2';

function Categories({swal}) {
  const [editedCategory, setEditedCategory] = useState(null);
  const [name,setName] = useState('');
  const [parentCategory,setParentCategory] = useState('');
  const [categories,setCategories] = useState([]);
  const [properties,setProperties] = useState([]);
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [])

  function fetchCategories() {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    });
  }

  // Generar slug automáticamente desde el nombre
  useEffect(() => {
    if (name && !editedCategory) {
      const generatedSlug = name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      setSlug(generatedSlug);
    }
  }, [name, editedCategory]);

  async function saveCategory(ev){
    ev.preventDefault();
    
    if (!name || !slug) {
      swal.fire({
        title: 'Error',
        text: 'Nombre y slug son requeridos',
        icon: 'error'
      });
      return;
    }

    const data = {
      nombre: name,
      descripcion: description,
      slug: slug,
      categoria_padre_id: parentCategory || null,
      url_imagen: imageUrl,
      orden: parseInt(order) || 0,
      esta_activa: isActive,
      // Enviar propiedades dentro de metadatos_seo como espera la API
      propiedades: properties.map(p => ({
        nombre: p.name,
        valores: p.values.split(',').map(v => v.trim()).filter(v => v),
      })),
    };

    try {
      if (editedCategory) {
        data.categoria_id = editedCategory.categoria_id;
        await axios.put('/api/categories', data);
        setEditedCategory(null);
      } else {
        await axios.post('/api/categories', data);
      }
      
      // Reset form
      setName('');
      setDescription('');
      setSlug('');
      setParentCategory('');
      setImageUrl('');
      setOrder(0);
      setIsActive(true);
      setProperties([]);
      
      fetchCategories();
      
      swal.fire({
        title: 'Success',
        text: `Categoría ${editedCategory ? 'actualizada' : 'creada'} exitosamente`,
        icon: 'success'
      });
    } catch (error) {
      swal.fire({
        title: 'Error',
        text: error.response?.data?.error || 'Error al guardar la categoría',
        icon: 'error'
      });
    }
  }

  function editCategory(category){
    setEditedCategory(category);
    setName(category.nombre);
    setDescription(category.descripcion || '');
    setSlug(category.slug);
    setParentCategory(category.categoria_padre_id || '');
    setImageUrl(category.url_imagen || '');
    setOrder(category.orden || 0);
    setIsActive(category.esta_activa);
    
    // Convertir propiedades desde metadatos_seo
    if (category.metadatos_seo && category.metadatos_seo.propiedades) {
      setProperties(
        category.metadatos_seo.propiedades.map(({nombre, valores}) => ({
          name: nombre,
          values: Array.isArray(valores) ? valores.join(', ') : valores
        }))
      );
    } else {
      setProperties([]);
    }
  }

  function deleteCategory(category){
    swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la categoría "${category.nombre}"?`,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: '#d55',
      reverseButtons: true,
    }).then(async result => {
      if (result.isConfirmed) {
        try {
          await axios.delete('/api/categories?id=' + category.categoria_id);
          fetchCategories();
          swal.fire({
            title: 'Eliminada',
            text: 'Categoría eliminada exitosamente',
            icon: 'success'
          });
        } catch (error) {
          swal.fire({
            title: 'Error',
            text: error.response?.data?.error || 'Error al eliminar la categoría',
            icon: 'error'
          });
        }
      }
    });
  }

  function addProperty() {
    setProperties(prev => {
      return [...prev, {name:'', values:''}];
    });
  }

  function handlePropertyNameChange(index, newName) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, newValues) {
    setProperties(prev => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(indexToRemove) {
    setProperties(prev => {
      return prev.filter((p, pIndex) => pIndex !== indexToRemove);
    });
  }

  return (
    <Layout>
      <h1>Categorías</h1>
      <div className="bg-white rounded-lg p-6 shadow-md">
        <label className="block text-lg font-semibold mb-4">
          {editedCategory
            ? `Editando categoría: ${editedCategory.nombre}`
            : 'Crear nueva categoría'}
        </label>
        
        <form onSubmit={saveCategory} className="space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Nombre de la categoría"
                onChange={ev => setName(ev.target.value)}
                value={name}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="slug-unico"
                onChange={ev => setSlug(ev.target.value)}
                value={slug}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Descripción de la categoría"
              rows="3"
              onChange={ev => setDescription(ev.target.value)}
              value={description}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Categoría padre</label>
              <select
                className="w-full p-2 border border-gray-300 rounded"
                onChange={ev => setParentCategory(ev.target.value)}
                value={parentCategory}
              >
                <option value="">Sin categoría padre</option>
                {categories.filter(cat => !cat.categoria_padre_id).map(category => (
                  <option key={category.categoria_id} value={category.categoria_id}>
                    {category.nombre}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="0"
                onChange={ev => setOrder(ev.target.value)}
                value={order}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">URL de imagen</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="https://ejemplo.com/imagen.jpg"
                onChange={ev => setImageUrl(ev.target.value)}
                value={imageUrl}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={ev => setIsActive(ev.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm font-medium">
              Categoría activa
            </label>
          </div>

          {/* Propiedades */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium mb-2">Propiedades</label>
            <button
              type="button"
              onClick={addProperty}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm mb-3 hover:bg-blue-600"
            >
              + Agregar propiedad
            </button>
            
            {properties.map((property, index) => (
              <div key={index} className="flex gap-2 mb-3 items-start">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder="Nombre de propiedad (ej: color)"
                  onChange={ev => handlePropertyNameChange(index, ev.target.value)}
                  value={property.name}
                />
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  placeholder="Valores separados por coma"
                  onChange={ev => handlePropertyValuesChange(index, ev.target.value)}
                  value={property.values}
                />
                <button
                  type="button"
                  onClick={() => removeProperty(index)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            {editedCategory && (
              <button
                type="button"
                onClick={() => {
                  setEditedCategory(null);
                  setName('');
                  setDescription('');
                  setSlug('');
                  setParentCategory('');
                  setImageUrl('');
                  setOrder(0);
                  setIsActive(true);
                  setProperties([]);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              {editedCategory ? 'Actualizar' : 'Crear'} Categoría
            </button>
          </div>
        </form>
      </div>

      {/* Lista de categorías */}
      {!editedCategory && (
        <div className="bg-white rounded-lg p-6 shadow-md mt-6">
          <h2 className="text-xl font-semibold mb-4">Lista de Categorías</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Nombre</th>
                  <th className="px-4 py-2 text-left">Slug</th>
                  <th className="px-4 py-2 text-left">Categoría Padre</th>
                  <th className="px-4 py-2 text-left">Productos</th>
                  <th className="px-4 py-2 text-left">Estado</th>
                  <th className="px-4 py-2 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category.categoria_id} className="border-t">
                    <td className="px-4 py-2 font-medium">{category.nombre}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-4 py-2">
                      {category.padre ? category.padre.nombre : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {category._count?.productos || 0}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        category.esta_activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.esta_activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => editCategory(category)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-blue-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteCategory(category)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default withSwal(({swal}, ref) => (
  <Categories swal={swal} />
));