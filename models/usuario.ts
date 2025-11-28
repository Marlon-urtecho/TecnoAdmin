import { Prisma } from '@prisma/client';

export type Usuario = {
  usuario_id: string;
  correo_electronico: string;
  correo_verificado: boolean;
  numero_telefono?: string | null;
  telefono_verificado: boolean;
  hash_contrasena?: string | null;
  esta_activo: boolean;
  es_personal: boolean;
  es_superusuario: boolean;
  ultimo_acceso?: Date | null;
  fecha_registro: Date;
  fecha_actualizacion: Date;
};

export type UsuarioWithRelations = Prisma.UsuarioGetPayload<{
  include: {
    perfil_usuario: true;
    cuentas_oauth: true;
    sesiones_usuario: true;
    direcciones: true;
    carritos: true;
    pedidos: true;
    metodos_pago: true;
    usos_cupon: true;
    listas_deseos: true;
    reseñas_producto: true;
    transacciones_inventario: true;
  };
}>;

export type CreateUsuarioInput = {
  correo_electronico: string;
  numero_telefono?: string;
  hash_contrasena?: string;
  es_personal?: boolean;
  es_superusuario?: boolean;
};

export type UpdateUsuarioInput = {
  correo_electronico?: string;
  numero_telefono?: string;
  telefono_verificado?: boolean;
  hash_contrasena?: string;
  esta_activo?: boolean;
  es_personal?: boolean;
  es_superusuario?: boolean;
  ultimo_acceso?: Date;
};