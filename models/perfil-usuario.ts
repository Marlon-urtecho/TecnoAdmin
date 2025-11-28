import { TipoGenero } from '@/types/enums';

export type PerfilUsuario = {
  perfil_id: string;
  usuario_id: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: Date | null;
  genero?: TipoGenero | null;
  url_avatar?: string | null;
  preferencias: any; // JSON
  suscrito_boletin: boolean;
  acepta_marketing: boolean;
  zona_horaria: string;
  localizacion: string;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
};

export type CreatePerfilUsuarioInput = {
  usuario_id: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento?: Date;
  genero?: TipoGenero;
  url_avatar?: string;
  preferencias?: any;
  suscrito_boletin?: boolean;
  acepta_marketing?: boolean;
  zona_horaria?: string;
  localizacion?: string;
};

export type UpdatePerfilUsuarioInput = {
  nombres?: string;
  apellidos?: string;
  fecha_nacimiento?: Date;
  genero?: TipoGenero;
  url_avatar?: string;
  preferencias?: any;
  suscrito_boletin?: boolean;
  acepta_marketing?: boolean;
  zona_horaria?: string;
  localizacion?: string;
};