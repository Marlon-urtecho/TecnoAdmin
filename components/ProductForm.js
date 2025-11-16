import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Spinner from "@/components/Spinner";
import { ReactSortable } from "react-sortablejs";

export default function ProductForm({
  producto_id,
  nombre: existingNombre,
  descripcion: existingDescripcion,
  descripcion_corta: existingDescripcionCorta,
  precio_base: existingPrecioBase,
  precio_comparacion: existingPrecioComparacion,
  precio_costo: existingPrecioCosto,
  sku: existingSku,
  slug: existingSlug,
  categoria_id: assignedCategoriaId,
  marca_id: assignedMarcaId,
  proveedor_id: assignedProveedorId,
  imagenes: existingImagenes,
  controlar_inventario: existingControlarInventario,
  permitir_pedidos_agotados: existingPermitirPedidosAgotados,
  umbral_stock_bajo: existingUmbralStockBajo,
  peso_gramos: existingPesoGramos,
  dimensiones: existingDimensiones,
  atributos: existingAtributos,
  especificaciones: existingEspecificaciones,
  url_imagen_principal: existingUrlImagenPrincipal,
  es_destacado: existingEsDestacado,
  esta_activo: existingEstaActivo,
  es_digital: existingEsDigital,
  meta_titulo: existingMetaTitulo,
  meta_descripcion: existingMetaDescripcion,
}) {
  // Estados principales
  const [nombre, setNombre] = useState(existingNombre || "");
  const [descripcion, setDescripcion] = useState(existingDescripcion || "");
  const [descripcion_corta, setDescripcionCorta] = useState(existingDescripcionCorta || "");
  const [precio_base, setPrecioBase] = useState(existingPrecioBase || "");
  const [precio_comparacion, setPrecioComparacion] = useState(existingPrecioComparacion || "");
  const [precio_costo, setPrecioCosto] = useState(existingPrecioCosto || "");
  const [sku, setSku] = useState(existingSku || "");
  const [slug, setSlug] = useState(existingSlug || "");
  const [categoria_id, setCategoriaId] = useState(assignedCategoriaId || "");
  const [marca_id, setMarcaId] = useState(assignedMarcaId || "");
  const [proveedor_id, setProveedorId] = useState(assignedProveedorId || "");
  const [imagenes, setImagenes] = useState(existingImagenes || []);
  const [controlar_inventario, setControlarInventario] = useState(existingControlarInventario ?? true);
  const [permitir_pedidos_agotados, setPermitirPedidosAgotados] = useState(existingPermitirPedidosAgotados ?? false);
  const [umbral_stock_bajo, setUmbralStockBajo] = useState(existingUmbralStockBajo || 5);
  const [peso_gramos, setPesoGramos] = useState(existingPesoGramos || "");
  const [dimensiones, setDimensiones] = useState(existingDimensiones || {});
  const [atributos, setAtributos] = useState(existingAtributos || {});
  const [especificaciones, setEspecificaciones] = useState(existingEspecificaciones || {});
  const [url_imagen_principal, setUrlImagenPrincipal] = useState(existingUrlImagenPrincipal || "");
  const [es_destacado, setEsDestacado] = useState(existingEsDestacado ?? false);
  const [esta_activo, setEstaActivo] = useState(existingEstaActivo ?? true);
  const [es_digital, setEsDigital] = useState(existingEsDigital ?? false);
  const [meta_titulo, setMetaTitulo] = useState(existingMetaTitulo || "");
  const [meta_descripcion, setMetaDescripcion] = useState(existingMetaDescripcion || "");

  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Cargar datos para los selects
    axios.get("/api/categories").then((result) => setCategorias(result.data));
    axios.get("/api/brands").then((result) => setMarcas(result.data));
    axios.get("/api/suppliers").then((result) => setProveedores(result.data));
  }, []);

  // Generar slug automáticamente desde el nombre
  useEffect(() => {
    if (!slug && nombre) {
      const generatedSlug = nombre
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  }, [nombre, slug]);

  async function saveProduct(ev) {
    ev.preventDefault();
    
    const data = {
      nombre,
      descripcion,
      descripcion_corta,
      precio_base: parseFloat(precio_base),
      precio_comparacion: precio_comparacion ? parseFloat(precio_comparacion) : null,
      precio_costo: precio_costo ? parseFloat(precio_costo) : null,
      sku,
      slug,
      categoria_id,
      marca_id,
      proveedor_id,
      imagenes,
      controlar_inventario,
      permitir_pedidos_agotados,
      umbral_stock_bajo: parseInt(umbral_stock_bajo),
      peso_gramos: peso_gramos ? parseInt(peso_gramos) : null,
      dimensiones,
      atributos,
      especificaciones,
      url_imagen_principal: url_imagen_principal || (imagenes.length > 0 ? imagenes[0] : null),
      es_destacado,
      esta_activo,
      es_digital,
      meta_titulo,
      meta_descripcion,
    };

    try {
      if (producto_id) {
        await axios.put("/api/products", { ...data, producto_id });
      } else {
        await axios.post("/api/products", data);
      }
      setGoToProducts(true);
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error al guardar el producto: " + (err.response?.data?.error || err.message));
    }
  }

  if (goToProducts) {
    router.push("/products");
    return null;
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (!files?.length) return;
    setIsUploading(true);
    const data = new FormData();
    for (const file of files) data.append("file", file);
    try {
      const res = await axios.post("/api/upload", data);
      setImagenes((oldImagenes) => [...oldImagenes, ...res.data.links]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Error al subir las imágenes");
    }
    setIsUploading(false);
  }

  function updateImagesOrder(imagenes) {
    setImagenes(imagenes);
  }

  return (
    <form onSubmit={saveProduct} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-6">
      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Nombre del Producto *</label>
          <input
            type="text"
            placeholder="Ingresa el nombre del producto"
            value={nombre}
            onChange={(ev) => setNombre(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">SKU *</label>
          <input
            type="text"
            placeholder="Código único del producto"
            value={sku}
            onChange={(ev) => setSku(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Slug *</label>
        <input
          type="text"
          placeholder="url-amigable-del-producto"
          value={slug}
          onChange={(ev) => setSlug(ev.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
          required
        />
      </div>

      {/* Categoría, Marca y Proveedor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Categoría *</label>
          <select
            value={categoria_id}
            onChange={(ev) => setCategoriaId(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((c) => (
              <option key={c.categoria_id} value={c.categoria_id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Marca *</label>
          <select
            value={marca_id}
            onChange={(ev) => setMarcaId(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            required
          >
            <option value="">Selecciona una marca</option>
            {marcas.map((m) => (
              <option key={m.marca_id} value={m.marca_id}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Proveedor</label>
          <select
            value={proveedor_id}
            onChange={(ev) => setProveedorId(ev.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.proveedor_id} value={p.proveedor_id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Precios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className="font-medium text-gray-700">Precio Base (USD) *</label>
          <input
            type="number"
            step="0.01"
            value={precio_base}
            onChange={(ev) => setPrecioBase(ev.target.value)}
            placeholder="0.00"
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Precio de Comparación</label>
          <input
            type="number"
            step="0.01"
            value={precio_comparacion}
            onChange={(ev) => setPrecioComparacion(ev.target.value)}
            placeholder="0.00"
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Precio de Costo</label>
          <input
            type="number"
            step="0.01"
            value={precio_costo}
            onChange={(ev) => setPrecioCosto(ev.target.value)}
            placeholder="0.00"
            className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
          />
        </div>
      </div>

      {/* Descripciones */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Descripción Corta</label>
        <input
          type="text"
          placeholder="Descripción breve del producto"
          value={descripcion_corta}
          onChange={(ev) => setDescripcionCorta(ev.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
        />
      </div>

      <div className="space-y-1">
        <label className="font-medium text-gray-700">Descripción Completa</label>
        <textarea
          value={descripcion}
          onChange={(ev) => setDescripcion(ev.target.value)}
          placeholder="Descripción detallada del producto"
          className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition resize-none"
          rows={4}
        />
      </div>

      {/* Imágenes */}
      <div className="space-y-1">
        <label className="font-medium text-gray-700">Imágenes del Producto</label>
        <div className="flex flex-wrap gap-3">
          <ReactSortable list={imagenes} setList={updateImagesOrder} className="flex flex-wrap gap-3">
            {imagenes.map((link) => (
              <div
                key={link}
                className="w-28 h-28 border border-gray-300 rounded-lg overflow-hidden shadow-sm relative"
              >
                <img src={link} alt="" className="object-cover w-full h-full" />
              </div>
            ))}
          </ReactSortable>

          {isUploading && (
            <div className="w-28 h-28 flex items-center justify-center border border-gray-300 rounded-lg bg-gray-50">
              <Spinner />
            </div>
          )}

          <label className="w-28 h-28 cursor-pointer flex flex-col items-center justify-center text-gray-500 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:text-blue-500 transition">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 mb-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <span className="text-xs text-center">Agregar Imagen</span>
            <input type="file" onChange={uploadImages} className="hidden" multiple accept="image/*" />
          </label>
        </div>
      </div>

      {/* Inventario y Físico */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Configuración de Inventario</h3>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={controlar_inventario}
              onChange={(ev) => setControlarInventario(ev.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Controlar inventario</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={permitir_pedidos_agotados}
              onChange={(ev) => setPermitirPedidosAgotados(ev.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Permitir pedidos agotados</span>
          </label>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Umbral de stock bajo</label>
            <input
              type="number"
              value={umbral_stock_bajo}
              onChange={(ev) => setUmbralStockBajo(ev.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Información Física</h3>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Peso (gramos)</label>
            <input
              type="number"
              value={peso_gramos}
              onChange={(ev) => setPesoGramos(ev.target.value)}
              placeholder="0"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            />
          </div>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={es_digital}
              onChange={(ev) => setEsDigital(ev.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Producto digital</span>
          </label>
        </div>
      </div>

      {/* Configuraciones Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Configuraciones</h3>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={es_destacado}
              onChange={(ev) => setEsDestacado(ev.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Producto destacado</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={esta_activo}
              onChange={(ev) => setEstaActivo(ev.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700">Producto activo</span>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">SEO</h3>
          
          <div className="space-y-1">
            <label className="font-medium text-gray-700">Meta Título</label>
            <input
              type="text"
              value={meta_titulo}
              onChange={(ev) => setMetaTitulo(ev.target.value)}
              placeholder="Título para SEO"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition"
            />
          </div>

          <div className="space-y-1">
            <label className="font-medium text-gray-700">Meta Descripción</label>
            <textarea
              value={meta_descripcion}
              onChange={(ev) => setMetaDescripcion(ev.target.value)}
              placeholder="Descripción para SEO"
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-300 transition resize-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Botón de Guardar */}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium shadow transition-all duration-300"
      >
        {producto_id ? "Actualizar Producto" : "Crear Producto"}
      </button>
    </form>
  );
}