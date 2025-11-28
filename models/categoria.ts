export type Categoria = {
  categoria_id: string;
  categoria_padre_id?: string | null;
  nombre: string;
  descripcion?: string | null;
  slug: string;
  url_imagen?: string | null;
  orden: number;
  esta_activa: boolean;
  metadatos_seo: any; // JSON
  fecha_creacion: Date;
  fecha_actualizacion: Date;
};

export type CategoriaWithRelations = Categoria & {
  padre?: Categoria | null;
  hijos?: Categoria[];
  productos?: any[]; // Producto[]
};

export type CreateCategoriaInput = {
  categoria_padre_id?: string;
  nombre: string;
  descripcion?: string;
  slug: string;
  url_imagen?: string;
  orden?: number;
  esta_activa?: boolean;
  metadatos_seo?: any;
};

export type UpdateCategoriaInput = {
  categoria_padre_id?: string;
  nombre?: string;
  descripcion?: string;
  slug?: string;
  url_imagen?: string;
  orden?: number;
  esta_activa?: boolean;
  metadatos_seo?: any;
};