import { CodigoMoneda } from '@/types/enums';

export type Carrito = {
  carrito_id: string;
  usuario_id?: string | null;
  sesion_id?: string | null;
  moneda: CodigoMoneda;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
  fecha_expiracion: Date;
};

export type CarritoWithItems = Carrito & {
  items: ItemCarrito[];
};

export type ItemCarrito = {
  item_carrito_id: string;
  carrito_id: string;
  producto_id: string;
  variante_id?: string | null;
  cantidad: number;
  precio_unitario: number;
  fecha_agregado: Date;
};

export type CreateCarritoInput = {
  usuario_id?: string;
  sesion_id?: string;
  moneda?: CodigoMoneda;
  fecha_expiracion: Date;
};

export type AddItemCarritoInput = {
  producto_id: string;
  variante_id?: string;
  cantidad: number;
  precio_unitario: number;
};

export type UpdateItemCarritoInput = {
  cantidad?: number;
  precio_unitario?: number;
};