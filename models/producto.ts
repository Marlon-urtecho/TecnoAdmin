export type Producto = {
  producto_id: string;
  sku: string;
  nombre: string;
  slug: string;
  descripcion?: string | null;
  descripcion_corta?: string | null;
  categoria_id: string;
  marca_id: string;
  proveedor_id: string;
  precio_base: number;
  precio_comparacion?: number | null;
  precio_costo?: number | null;
  controlar_inventario: boolean;
  permitir_pedidos_agotados: boolean;
  umbral_stock_bajo: number;
  peso_gramos?: number | null;
  dimensiones: any; // JSON
  atributos: any; // JSON
  especificaciones: any; // JSON
  url_imagen_principal?: string | null;
  es_destacado: boolean;
  esta_activo: boolean;
  es_digital: boolean;
  meta_titulo?: string | null;
  meta_descripcion?: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
};

export type CreateProductoInput = {
  sku: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  descripcion_corta?: string;
  categoria_id: string;
  marca_id: string;
  proveedor_id: string;
  precio_base: number;
  precio_comparacion?: number;
  precio_costo?: number;
  controlar_inventario?: boolean;
  permitir_pedidos_agotados?: boolean;
  umbral_stock_bajo?: number;
  peso_gramos?: number;
  dimensiones?: any;
  atributos?: any;
  especificaciones?: any;
  url_imagen_principal?: string;
  es_destacado?: boolean;
  esta_activo?: boolean;
  es_digital?: boolean;
  meta_titulo?: string;
  meta_descripcion?: string;
};

export type UpdateProductoInput = {
  sku?: string;
  nombre?: string;
  slug?: string;
  descripcion?: string;
  descripcion_corta?: string;
  categoria_id?: string;
  marca_id?: string;
  proveedor_id?: string;
  precio_base?: number;
  precio_comparacion?: number;
  precio_costo?: number;
  controlar_inventario?: boolean;
  permitir_pedidos_agotados?: boolean;
  umbral_stock_bajo?: number;
  peso_gramos?: number;
  dimensiones?: any;
  atributos?: any;
  especificaciones?: any;
  url_imagen_principal?: string;
  es_destacado?: boolean;
  esta_activo?: boolean;
  es_digital?: boolean;
  meta_titulo?: string;
  meta_descripcion?: string;
};