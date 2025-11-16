import { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";

export default function SupplierForm({
  proveedor_id,
  nombre: existingNombre,
  persona_contacto: existingPersonaContacto,
  correo_electronico: existingCorreoElectronico,
  numero_telefono: existingNumeroTelefono,
  url_sitio_web: existingUrlSitioWeb,
  esta_activo: existingEstaActivo,
}) {
  const [nombre, setNombre] = useState(existingNombre || "");
  const [persona_contacto, setPersonaContacto] = useState(existingPersonaContacto || "");
  const [correo_electronico, setCorreoElectronico] = useState(existingCorreoElectronico || "");
  const [numero_telefono, setNumeroTelefono] = useState(existingNumeroTelefono || "");
  const [url_sitio_web, setUrlSitioWeb] = useState(existingUrlSitioWeb || "");
  const [esta_activo, setEstaActivo] = useState(existingEstaActivo ?? true);
  
  const [goToSuppliers, setGoToSuppliers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  async function saveSupplier(ev) {
    ev.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validaciones básicas
    const newErrors = {};
    if (!nombre.trim()) {
      newErrors.nombre = "El nombre del proveedor es requerido";
    }
    if (correo_electronico && !isValidEmail(correo_electronico)) {
      newErrors.correo_electronico = "El formato del email no es válido";
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
      persona_contacto: persona_contacto.trim() || null,
      correo_electronico: correo_electronico.trim() || null,
      numero_telefono: numero_telefono.trim() || null,
      url_sitio_web: url_sitio_web.trim() || null,
      esta_activo,
    };

    try {
      if (proveedor_id) {
        await axios.put("/api/suppliers", { ...data, proveedor_id });
      } else {
        await axios.post("/api/suppliers", data);
      }
      setGoToSuppliers(true);
    } catch (err) {
      console.error("Error saving supplier:", err);
      if (err.response?.data?.error) {
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: "Error al guardar el proveedor" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (goToSuppliers) {
    router.push("/suppliers");
    return null;
  }

  // Funciones de validación
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <form onSubmit={saveSupplier} className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
      {/* Encabezado */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {proveedor_id ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}
        </h2>
        <p className="text-gray-600 mt-1">
          {proveedor_id 
            ? "Actualiza la información del proveedor" 
            : "Completa la información para agregar un nuevo proveedor"
          }
        </p>
      </div>

      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
        
        <div className="space-y-1">
          <label className="font-medium text-gray-700">
            Nombre del Proveedor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Ingresa el nombre del proveedor"
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
          <label className="font-medium text-gray-700">Persona de Contacto</label>
          <input
            type="text"
            placeholder="Nombre de la persona de contacto"
            value={persona_contacto}
            onChange={(ev) => setPersonaContacto(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Correo Electrónico</label>
            <input
              type="email"
              placeholder="proveedor@ejemplo.com"
              value={correo_electronico}
              onChange={(ev) => setCorreoElectronico(ev.target.value)}
              className={`w-full p-3 rounded-lg border focus:ring-1 focus:ring-blue-300 transition ${
                errors.correo_electronico 
                  ? "border-red-300 focus:border-red-500" 
                  : "border-gray-300 focus:border-blue-500"
              }`}
              disabled={isSubmitting}
            />
            {errors.correo_electronico && (
              <p className="text-red-600 text-sm mt-1">{errors.correo_electronico}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Número de Teléfono</label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              value={numero_telefono}
              onChange={(ev) => setNumeroTelefono(ev.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
              disabled={isSubmitting}
            />
          </div>
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

      {/* Configuración */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Configuración</h3>
        
        <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={esta_activo}
            onChange={(ev) => setEstaActivo(ev.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <div>
            <span className="font-medium text-gray-700">Proveedor Activo</span>
            <p className="text-sm text-gray-500 mt-1">
              Los proveedores inactivos no estarán disponibles para asignar a nuevos productos
            </p>
          </div>
        </label>
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
              {proveedor_id ? "Actualizando..." : "Guardando..."}
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {proveedor_id ? "Actualizar Proveedor" : "Guardar Proveedor"}
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => router.push("/suppliers")}
          disabled={isSubmitting}
          className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Cancelar
        </button>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div className="text-sm text-blue-700">
            <strong>Nota:</strong> El nombre del proveedor es requerido y debe ser único. 
            Los proveedores activos estarán disponibles para asignar a productos nuevos y existentes.
          </div>
        </div>
      </div>
    </form>
  );
}