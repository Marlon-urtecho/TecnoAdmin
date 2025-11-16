import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

function BrandForm({
  marca_id,
  nombre: existingNombre,
  descripcion: existingDescripcion,
  url_logo: existingUrlLogo,
  url_sitio_web: existingUrlSitioWeb,
  orden: existingOrden,
  esta_activa: existingEstaActiva,
}) {
  const [nombre, setNombre] = useState(existingNombre || "");
  const [descripcion, setDescripcion] = useState(existingDescripcion || "");
  const [url_logo, setUrlLogo] = useState(existingUrlLogo || "");
  const [url_sitio_web, setUrlSitioWeb] = useState(existingUrlSitioWeb || "");
  const [orden, setOrden] = useState(existingOrden || 0);
  const [esta_activa, setEstaActiva] = useState(existingEstaActiva ?? true);
  
  const [goToBrands, setGoToBrands] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  async function saveBrand(ev) {
    ev.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validaciones básicas
    const newErrors = {};
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre de la marca es requerido";
    }
    if (url_logo && !isValidUrl(url_logo)) {
      newErrors.url_logo = "La URL del logo no es válida";
    }
    if (url_sitio_web && !isValidUrl(url_sitio_web)) {
      newErrors.url_sitio_web = "La URL del sitio web no es válida";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    const data = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || null,
      url_logo: url_logo.trim() || null,
      url_sitio_web: url_sitio_web.trim() || null,
      orden: parseInt(orden) || 0,
      esta_activa,
    };

    try {
      if (marca_id) {
        await axios.put("/api/brands", { ...data, marca_id });
      } else {
        await axios.post("/api/brands", data);
      }
      setGoToBrands(true);
    } catch (err) {
      console.error("Error saving brand:", err);
      if (err.response?.data?.error) {
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: "Error al guardar la marca" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (goToBrands) {
    router.push("/brands");
    return null;
  }

  // Funciones de validación
  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <form onSubmit={saveBrand} className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {marca_id ? "Editar Marca" : "Agregar Nueva Marca"}
        </h2>
        <p className="text-gray-600 mt-1">
          {marca_id 
            ? "Actualiza la información de la marca" 
            : "Completa la información para agregar una nueva marca"
          }
        </p>
      </div>

      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
        
        <div className="space-y-1">
          <label className="font-medium text-gray-700">
            Nombre de la Marca <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ingresa el nombre de la marca"
            value={nombre}
            onChange={(ev) => setNombre(ev.target.value)}
            className={`w-full p-3 rounded-lg border focus:ring-1 focus:ring-blue-300 transition ${
              errors.nombre 
                ? "border-red-300 focus:border-red-500" 
                : "border-gray-300 focus:border-blue-500"
            }`}
            disabled={isSubmitting}
          />
          {errors.nombre && (
            <p className="text-red-600 text-sm mt-1">{errors.nombre}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Descripción</label>
          <textarea
            placeholder="Describe la marca (opcional)"
            value={descripcion}
            onChange={(ev) => setDescripcion(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition resize-none"
            rows={3}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* URLs */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Enlaces</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-700">URL del Logo</label>
            <input
              type="url"
              placeholder="https://ejemplo.com/logo.png"
              value={url_logo}
              onChange={(ev) => setUrlLogo(ev.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-1 focus:ring-blue-300 transition ${
                errors.url_logo 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={isSubmitting}
            />
            {errors.url_logo && (
              <p className="text-red-600 text-sm mt-1">{errors.url_logo}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Sitio Web</label>
            <input
              type="url"
              placeholder="https://www.ejemplo.com"
              value={url_sitio_web}
              onChange={(ev) => setUrlSitioWeb(ev.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-1 focus:ring-blue-300 transition ${
                errors.url_sitio_web 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={isSubmitting}
            />
            {errors.url_sitio_web && (
              <p className="text-red-600 text-sm mt-1">{errors.url_sitio_web}</p>
            )}
          </div>
        </div>

        {/* Vista previa del logo */}
        {url_logo && (
          <div className="space-y-2">
            <label className="font-medium text-gray-700">Vista Previa del Logo</label>
            <div className="border border-gray-200 rounded-lg p-4 flex justify-center">
              <img 
                src={url_logo} 
                alt="Vista previa del logo" 
                className="max-w-32 max-h-32 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Configuración */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Orden</label>
            <input
              type="number"
              placeholder="0"
              value={orden}
              onChange={(ev) => setOrden(ev.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
              disabled={isSubmitting}
              min="0"
            />
            <p className="text-sm text-gray-500 mt-1">
              Las marcas se ordenarán por este número (menor = primero)
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={esta_activa}
                onChange={(ev) => setEstaActiva(ev.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <div>
                <span className="font-medium text-gray-700">Marca Activa</span>
                <p className="text-sm text-gray-500 mt-1">
                  Las marcas inactivas no estarán disponibles para nuevos productos
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Errores de submit */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">{errors.submit}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-lg font-medium shadow transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {marca_id ? "Actualizando..." : "Guardando..."}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {marca_id ? "Actualizar Marca" : "Guardar Marca"}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => router.push("/brands")}
          disabled={isSubmitting}
          className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default BrandForm;