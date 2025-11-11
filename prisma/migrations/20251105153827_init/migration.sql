-- CreateEnum
CREATE TYPE "TipoGenero" AS ENUM ('masculino', 'femenino', 'otro', 'prefiere_no_decir');

-- CreateEnum
CREATE TYPE "TipoDireccion" AS ENUM ('facturacion', 'envio', 'ambos');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado', 'reembolsado');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('pendiente', 'procesando', 'pagado', 'fallido', 'reembolsado', 'parcialmente_reembolsado');

-- CreateEnum
CREATE TYPE "EstadoFulfillment" AS ENUM ('no_completado', 'parcialmente_completado', 'completado');

-- CreateEnum
CREATE TYPE "TipoTransaccionInventario" AS ENUM ('compra', 'devolucion', 'ajuste', 'danado', 'recibido', 'reservado', 'liberado');

-- CreateEnum
CREATE TYPE "TipoReferencia" AS ENUM ('pedido', 'ajuste', 'devolucion', 'transferencia');

-- CreateEnum
CREATE TYPE "CodigoMoneda" AS ENUM ('USD', 'EUR', 'GBP', 'MXN');

-- CreateEnum
CREATE TYPE "ProveedorPago" AS ENUM ('stripe', 'paypal', 'square');

-- CreateEnum
CREATE TYPE "TipoMetodoPago" AS ENUM ('tarjeta', 'paypal', 'transferencia_bancaria', 'apple_pay', 'google_pay');

-- CreateEnum
CREATE TYPE "MarcaTarjeta" AS ENUM ('visa', 'mastercard', 'american_express', 'discover', 'diners_club', 'jcb', 'unionpay');

-- CreateEnum
CREATE TYPE "TipoDescuento" AS ENUM ('porcentaje', 'monto_fijo', 'envio_gratuito');

-- CreateEnum
CREATE TYPE "TipoDatoConfiguracion" AS ENUM ('texto', 'numero', 'booleano', 'json', 'arreglo');

-- CreateTable
CREATE TABLE "usuario" (
    "usuario_id" TEXT NOT NULL,
    "correo_electronico" TEXT NOT NULL,
    "correo_verificado" BOOLEAN NOT NULL DEFAULT false,
    "numero_telefono" TEXT,
    "telefono_verificado" BOOLEAN NOT NULL DEFAULT false,
    "hash_contrasena" TEXT,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "es_personal" BOOLEAN NOT NULL DEFAULT false,
    "es_superusuario" BOOLEAN NOT NULL DEFAULT false,
    "ultimo_acceso" TIMESTAMP(3),
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "perfil_usuario" (
    "perfil_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "genero" "TipoGenero",
    "url_avatar" TEXT,
    "preferencias" JSONB NOT NULL DEFAULT '{}',
    "suscrito_boletin" BOOLEAN NOT NULL DEFAULT true,
    "acepta_marketing" BOOLEAN NOT NULL DEFAULT true,
    "zona_horaria" TEXT NOT NULL DEFAULT 'UTC',
    "localizacion" TEXT NOT NULL DEFAULT 'es-ES',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfil_usuario_pkey" PRIMARY KEY ("perfil_id")
);

-- CreateTable
CREATE TABLE "proveedor_oauth" (
    "proveedor_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "secreto_cliente" TEXT NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "configuracion" JSONB NOT NULL DEFAULT '{}',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedor_oauth_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "cuenta_oauth" (
    "cuenta_oauth_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "id_usuario_proveedor" TEXT NOT NULL,
    "token_acceso" TEXT,
    "token_actualizacion" TEXT,
    "token_expiracion" TIMESTAMP(3),
    "alcance" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cuenta_oauth_pkey" PRIMARY KEY ("cuenta_oauth_id")
);

-- CreateTable
CREATE TABLE "sesion_usuario" (
    "sesion_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "token_sesion" TEXT NOT NULL,
    "informacion_dispositivo" JSONB NOT NULL DEFAULT '{}',
    "direccion_ip" TEXT,
    "agente_usuario" TEXT,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sesion_usuario_pkey" PRIMARY KEY ("sesion_id")
);

-- CreateTable
CREATE TABLE "direccion" (
    "direccion_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "tipo_direccion" "TipoDireccion" NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "nombre_destinatario" TEXT,
    "nombre_empresa" TEXT,
    "linea_direccion1" TEXT NOT NULL,
    "linea_direccion2" TEXT,
    "ciudad" TEXT NOT NULL,
    "estado_provincia" TEXT NOT NULL,
    "codigo_postal" TEXT NOT NULL,
    "codigo_pais" TEXT NOT NULL,
    "numero_telefono" TEXT,
    "instrucciones_entrega" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "direccion_pkey" PRIMARY KEY ("direccion_id")
);

-- CreateTable
CREATE TABLE "categoria" (
    "categoria_id" TEXT NOT NULL,
    "categoria_padre_id" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "slug" TEXT NOT NULL,
    "url_imagen" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esta_activa" BOOLEAN NOT NULL DEFAULT true,
    "metadatos_seo" JSONB NOT NULL DEFAULT '{}',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("categoria_id")
);

-- CreateTable
CREATE TABLE "marca" (
    "marca_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "url_logo" TEXT,
    "url_sitio_web" TEXT,
    "esta_activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "marca_pkey" PRIMARY KEY ("marca_id")
);

-- CreateTable
CREATE TABLE "proveedor" (
    "proveedor_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "persona_contacto" TEXT,
    "correo_electronico" TEXT,
    "numero_telefono" TEXT,
    "url_sitio_web" TEXT,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proveedor_pkey" PRIMARY KEY ("proveedor_id")
);

-- CreateTable
CREATE TABLE "producto" (
    "producto_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descripcion" TEXT,
    "descripcion_corta" TEXT,
    "categoria_id" TEXT NOT NULL,
    "marca_id" TEXT NOT NULL,
    "proveedor_id" TEXT NOT NULL,
    "precio_base" DOUBLE PRECISION NOT NULL,
    "precio_comparacion" DOUBLE PRECISION,
    "precio_costo" DOUBLE PRECISION,
    "controlar_inventario" BOOLEAN NOT NULL DEFAULT true,
    "permitir_pedidos_agotados" BOOLEAN NOT NULL DEFAULT false,
    "umbral_stock_bajo" INTEGER NOT NULL DEFAULT 5,
    "peso_gramos" INTEGER,
    "dimensiones" JSONB NOT NULL DEFAULT '{}',
    "atributos" JSONB NOT NULL DEFAULT '{}',
    "especificaciones" JSONB NOT NULL DEFAULT '{}',
    "url_imagen_principal" TEXT,
    "es_destacado" BOOLEAN NOT NULL DEFAULT false,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "es_digital" BOOLEAN NOT NULL DEFAULT false,
    "meta_titulo" TEXT,
    "meta_descripcion" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "producto_pkey" PRIMARY KEY ("producto_id")
);

-- CreateTable
CREATE TABLE "variante_producto" (
    "variante_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombre_variante" TEXT NOT NULL,
    "ajuste_precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "atributos" JSONB NOT NULL,
    "url_imagen" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "esta_activa" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "variante_producto_pkey" PRIMARY KEY ("variante_id")
);

-- CreateTable
CREATE TABLE "imagen_producto" (
    "imagen_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "variante_id" TEXT,
    "url_imagen" TEXT NOT NULL,
    "texto_alternativo" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagen_producto_pkey" PRIMARY KEY ("imagen_id")
);

-- CreateTable
CREATE TABLE "reseña_producto" (
    "reseña_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "item_pedido_id" TEXT,
    "calificacion" INTEGER NOT NULL,
    "titulo" TEXT,
    "comentario" TEXT,
    "es_compra_verificada" BOOLEAN NOT NULL DEFAULT false,
    "esta_aprobada" BOOLEAN NOT NULL DEFAULT true,
    "contador_util" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reseña_producto_pkey" PRIMARY KEY ("reseña_id")
);

-- CreateTable
CREATE TABLE "inventario" (
    "inventario_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "variante_id" TEXT,
    "cantidad_stock" INTEGER NOT NULL DEFAULT 0,
    "cantidad_reservada" INTEGER NOT NULL DEFAULT 0,
    "cantidad_disponible" INTEGER NOT NULL DEFAULT 0,
    "alerta_stock_bajo" BOOLEAN NOT NULL DEFAULT false,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventario_pkey" PRIMARY KEY ("inventario_id")
);

-- CreateTable
CREATE TABLE "transaccion_inventario" (
    "transaccion_id" TEXT NOT NULL,
    "inventario_id" TEXT NOT NULL,
    "tipo_transaccion" "TipoTransaccionInventario" NOT NULL,
    "cambio_cantidad" INTEGER NOT NULL,
    "cantidad_anterior" INTEGER NOT NULL,
    "cantidad_nueva" INTEGER NOT NULL,
    "tipo_referencia" "TipoReferencia",
    "referencia_id" TEXT,
    "razon" TEXT,
    "creado_por" TEXT,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaccion_inventario_pkey" PRIMARY KEY ("transaccion_id")
);

-- CreateTable
CREATE TABLE "carrito" (
    "carrito_id" TEXT NOT NULL,
    "usuario_id" TEXT,
    "sesion_id" TEXT,
    "moneda" "CodigoMoneda" NOT NULL DEFAULT 'USD',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrito_pkey" PRIMARY KEY ("carrito_id")
);

-- CreateTable
CREATE TABLE "item_carrito" (
    "item_carrito_id" TEXT NOT NULL,
    "carrito_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "variante_id" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "fecha_agregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_carrito_pkey" PRIMARY KEY ("item_carrito_id")
);

-- CreateTable
CREATE TABLE "pedido" (
    "pedido_id" TEXT NOT NULL,
    "numero_pedido" TEXT NOT NULL,
    "usuario_id" TEXT,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'pendiente',
    "estado_pago" "EstadoPago" NOT NULL DEFAULT 'pendiente',
    "estado_fulfillment" "EstadoFulfillment" NOT NULL DEFAULT 'no_completado',
    "correo_cliente" TEXT NOT NULL,
    "telefono_cliente" TEXT,
    "direccion_facturacion_id" TEXT NOT NULL,
    "direccion_envio_id" TEXT NOT NULL,
    "moneda" "CodigoMoneda" NOT NULL DEFAULT 'USD',
    "subtotal_items" DOUBLE PRECISION NOT NULL,
    "costo_envio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_impuestos" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monto_total" DOUBLE PRECISION NOT NULL,
    "metodo_envio_id" TEXT,
    "numero_seguimiento" TEXT,
    "fecha_entrega_estimada" TIMESTAMP(3),
    "fecha_pago" TIMESTAMP(3),
    "fecha_fulfillment" TIMESTAMP(3),
    "fecha_cancelacion" TIMESTAMP(3),
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedido_pkey" PRIMARY KEY ("pedido_id")
);

-- CreateTable
CREATE TABLE "item_pedido" (
    "item_pedido_id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "variante_id" TEXT,
    "nombre_producto" TEXT NOT NULL,
    "sku_producto" TEXT NOT NULL,
    "atributos_variante" JSONB NOT NULL DEFAULT '{}',
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "precio_total" DOUBLE PRECISION NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pedido_pkey" PRIMARY KEY ("item_pedido_id")
);

-- CreateTable
CREATE TABLE "metodo_envio" (
    "metodo_envio_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DOUBLE PRECISION NOT NULL,
    "umbral_envio_gratuito" DOUBLE PRECISION,
    "dias_estimados_min" INTEGER,
    "dias_estimados_max" INTEGER,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodo_envio_pkey" PRIMARY KEY ("metodo_envio_id")
);

-- CreateTable
CREATE TABLE "metodo_pago" (
    "metodo_pago_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "proveedor" "ProveedorPago" NOT NULL,
    "tipo_metodo" "TipoMetodoPago" NOT NULL,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "token_pago" TEXT NOT NULL,
    "huella_digital" TEXT,
    "ultimos_4_digitos" TEXT,
    "marca_tarjeta" "MarcaTarjeta",
    "mes_expiracion" INTEGER,
    "año_expiracion" INTEGER,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "metodo_pago_pkey" PRIMARY KEY ("metodo_pago_id")
);

-- CreateTable
CREATE TABLE "pago" (
    "pago_id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "metodo_pago_id" TEXT,
    "id_intento_pago" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" "CodigoMoneda" NOT NULL DEFAULT 'USD',
    "estado" "EstadoPago" NOT NULL,
    "respuesta_pasarela" JSONB NOT NULL DEFAULT '{}',
    "razon_fallo" TEXT,
    "monto_reembolsado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pago_pkey" PRIMARY KEY ("pago_id")
);

-- CreateTable
CREATE TABLE "cupon" (
    "cupon_id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo_descuento" "TipoDescuento" NOT NULL,
    "valor_descuento" DOUBLE PRECISION NOT NULL,
    "monto_pedido_minimo" DOUBLE PRECISION,
    "monto_descuento_maximo" DOUBLE PRECISION,
    "limite_usos" INTEGER,
    "limite_usos_por_usuario" INTEGER NOT NULL DEFAULT 1,
    "contador_usos" INTEGER NOT NULL DEFAULT 0,
    "valido_desde" TIMESTAMP(3) NOT NULL,
    "valido_hasta" TIMESTAMP(3) NOT NULL,
    "esta_activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cupon_pkey" PRIMARY KEY ("cupon_id")
);

-- CreateTable
CREATE TABLE "uso_cupon" (
    "uso_cupon_id" TEXT NOT NULL,
    "cupon_id" TEXT NOT NULL,
    "pedido_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "monto_descuento" DOUBLE PRECISION NOT NULL,
    "fecha_uso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uso_cupon_pkey" PRIMARY KEY ("uso_cupon_id")
);

-- CreateTable
CREATE TABLE "lista_deseos" (
    "lista_deseos_id" TEXT NOT NULL,
    "usuario_id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Mi Lista de Deseos',
    "es_publica" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_deseos_pkey" PRIMARY KEY ("lista_deseos_id")
);

-- CreateTable
CREATE TABLE "item_lista_deseos" (
    "item_lista_deseos_id" TEXT NOT NULL,
    "lista_deseos_id" TEXT NOT NULL,
    "producto_id" TEXT NOT NULL,
    "variante_id" TEXT,
    "fecha_agregado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_lista_deseos_pkey" PRIMARY KEY ("item_lista_deseos_id")
);

-- CreateTable
CREATE TABLE "configuracion_sitio" (
    "configuracion_id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" JSONB NOT NULL,
    "tipo_dato" "TipoDatoConfiguracion" NOT NULL,
    "descripcion" TEXT,
    "es_publica" BOOLEAN NOT NULL DEFAULT false,
    "actualizado_por" TEXT,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "configuracion_sitio_pkey" PRIMARY KEY ("configuracion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_electronico_key" ON "usuario"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuario_correo_electronico_idx" ON "usuario"("correo_electronico");

-- CreateIndex
CREATE INDEX "usuario_numero_telefono_idx" ON "usuario"("numero_telefono");

-- CreateIndex
CREATE INDEX "usuario_esta_activo_idx" ON "usuario"("esta_activo");

-- CreateIndex
CREATE INDEX "usuario_fecha_registro_idx" ON "usuario" USING BRIN ("fecha_registro");

-- CreateIndex
CREATE UNIQUE INDEX "perfil_usuario_usuario_id_key" ON "perfil_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "perfil_usuario_usuario_id_idx" ON "perfil_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "perfil_usuario_nombres_idx" ON "perfil_usuario"("nombres");

-- CreateIndex
CREATE INDEX "perfil_usuario_apellidos_idx" ON "perfil_usuario"("apellidos");

-- CreateIndex
CREATE INDEX "proveedor_oauth_nombre_idx" ON "proveedor_oauth"("nombre");

-- CreateIndex
CREATE INDEX "proveedor_oauth_esta_activo_idx" ON "proveedor_oauth"("esta_activo");

-- CreateIndex
CREATE INDEX "cuenta_oauth_usuario_id_idx" ON "cuenta_oauth"("usuario_id");

-- CreateIndex
CREATE INDEX "cuenta_oauth_proveedor_id_idx" ON "cuenta_oauth"("proveedor_id");

-- CreateIndex
CREATE INDEX "cuenta_oauth_id_usuario_proveedor_idx" ON "cuenta_oauth"("id_usuario_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "cuenta_oauth_proveedor_id_id_usuario_proveedor_key" ON "cuenta_oauth"("proveedor_id", "id_usuario_proveedor");

-- CreateIndex
CREATE UNIQUE INDEX "sesion_usuario_token_sesion_key" ON "sesion_usuario"("token_sesion");

-- CreateIndex
CREATE INDEX "sesion_usuario_usuario_id_idx" ON "sesion_usuario"("usuario_id");

-- CreateIndex
CREATE INDEX "sesion_usuario_token_sesion_idx" ON "sesion_usuario"("token_sesion");

-- CreateIndex
CREATE INDEX "sesion_usuario_fecha_expiracion_idx" ON "sesion_usuario" USING BRIN ("fecha_expiracion");

-- CreateIndex
CREATE INDEX "direccion_usuario_id_idx" ON "direccion"("usuario_id");

-- CreateIndex
CREATE INDEX "direccion_tipo_direccion_idx" ON "direccion"("tipo_direccion");

-- CreateIndex
CREATE INDEX "direccion_codigo_pais_idx" ON "direccion"("codigo_pais");

-- CreateIndex
CREATE INDEX "direccion_es_principal_idx" ON "direccion"("es_principal");

-- CreateIndex
CREATE UNIQUE INDEX "categoria_slug_key" ON "categoria"("slug");

-- CreateIndex
CREATE INDEX "categoria_categoria_padre_id_idx" ON "categoria"("categoria_padre_id");

-- CreateIndex
CREATE INDEX "categoria_slug_idx" ON "categoria"("slug");

-- CreateIndex
CREATE INDEX "categoria_esta_activa_idx" ON "categoria"("esta_activa");

-- CreateIndex
CREATE INDEX "categoria_orden_idx" ON "categoria"("orden");

-- CreateIndex
CREATE INDEX "marca_nombre_idx" ON "marca"("nombre");

-- CreateIndex
CREATE INDEX "marca_esta_activa_idx" ON "marca"("esta_activa");

-- CreateIndex
CREATE INDEX "proveedor_nombre_idx" ON "proveedor"("nombre");

-- CreateIndex
CREATE INDEX "proveedor_esta_activo_idx" ON "proveedor"("esta_activo");

-- CreateIndex
CREATE UNIQUE INDEX "producto_sku_key" ON "producto"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "producto_slug_key" ON "producto"("slug");

-- CreateIndex
CREATE INDEX "producto_sku_idx" ON "producto"("sku");

-- CreateIndex
CREATE INDEX "producto_slug_idx" ON "producto"("slug");

-- CreateIndex
CREATE INDEX "producto_categoria_id_idx" ON "producto"("categoria_id");

-- CreateIndex
CREATE INDEX "producto_marca_id_idx" ON "producto"("marca_id");

-- CreateIndex
CREATE INDEX "producto_proveedor_id_idx" ON "producto"("proveedor_id");

-- CreateIndex
CREATE INDEX "producto_precio_base_idx" ON "producto"("precio_base");

-- CreateIndex
CREATE INDEX "producto_es_destacado_idx" ON "producto"("es_destacado");

-- CreateIndex
CREATE INDEX "producto_esta_activo_idx" ON "producto"("esta_activo");

-- CreateIndex
CREATE INDEX "producto_fecha_creacion_idx" ON "producto" USING BRIN ("fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "variante_producto_sku_key" ON "variante_producto"("sku");

-- CreateIndex
CREATE INDEX "variante_producto_producto_id_idx" ON "variante_producto"("producto_id");

-- CreateIndex
CREATE INDEX "variante_producto_sku_idx" ON "variante_producto"("sku");

-- CreateIndex
CREATE INDEX "variante_producto_esta_activa_idx" ON "variante_producto"("esta_activa");

-- CreateIndex
CREATE INDEX "imagen_producto_producto_id_idx" ON "imagen_producto"("producto_id");

-- CreateIndex
CREATE INDEX "imagen_producto_variante_id_idx" ON "imagen_producto"("variante_id");

-- CreateIndex
CREATE INDEX "imagen_producto_orden_idx" ON "imagen_producto"("orden");

-- CreateIndex
CREATE INDEX "reseña_producto_producto_id_idx" ON "reseña_producto"("producto_id");

-- CreateIndex
CREATE INDEX "reseña_producto_usuario_id_idx" ON "reseña_producto"("usuario_id");

-- CreateIndex
CREATE INDEX "reseña_producto_calificacion_idx" ON "reseña_producto"("calificacion");

-- CreateIndex
CREATE INDEX "reseña_producto_esta_aprobada_idx" ON "reseña_producto"("esta_aprobada");

-- CreateIndex
CREATE INDEX "reseña_producto_fecha_creacion_idx" ON "reseña_producto" USING BRIN ("fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "inventario_variante_id_key" ON "inventario"("variante_id");

-- CreateIndex
CREATE INDEX "inventario_producto_id_idx" ON "inventario"("producto_id");

-- CreateIndex
CREATE INDEX "inventario_variante_id_idx" ON "inventario"("variante_id");

-- CreateIndex
CREATE INDEX "inventario_cantidad_disponible_idx" ON "inventario"("cantidad_disponible");

-- CreateIndex
CREATE INDEX "inventario_alerta_stock_bajo_idx" ON "inventario"("alerta_stock_bajo");

-- CreateIndex
CREATE INDEX "transaccion_inventario_inventario_id_idx" ON "transaccion_inventario"("inventario_id");

-- CreateIndex
CREATE INDEX "transaccion_inventario_tipo_transaccion_idx" ON "transaccion_inventario"("tipo_transaccion");

-- CreateIndex
CREATE INDEX "transaccion_inventario_tipo_referencia_idx" ON "transaccion_inventario"("tipo_referencia");

-- CreateIndex
CREATE INDEX "transaccion_inventario_referencia_id_idx" ON "transaccion_inventario"("referencia_id");

-- CreateIndex
CREATE INDEX "transaccion_inventario_fecha_creacion_idx" ON "transaccion_inventario" USING BRIN ("fecha_creacion");

-- CreateIndex
CREATE INDEX "carrito_usuario_id_idx" ON "carrito"("usuario_id");

-- CreateIndex
CREATE INDEX "carrito_sesion_id_idx" ON "carrito"("sesion_id");

-- CreateIndex
CREATE INDEX "carrito_fecha_expiracion_idx" ON "carrito"("fecha_expiracion");

-- CreateIndex
CREATE INDEX "item_carrito_carrito_id_idx" ON "item_carrito"("carrito_id");

-- CreateIndex
CREATE INDEX "item_carrito_producto_id_idx" ON "item_carrito"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedido_numero_pedido_key" ON "pedido"("numero_pedido");

-- CreateIndex
CREATE INDEX "pedido_numero_pedido_idx" ON "pedido"("numero_pedido");

-- CreateIndex
CREATE INDEX "pedido_usuario_id_idx" ON "pedido"("usuario_id");

-- CreateIndex
CREATE INDEX "pedido_estado_idx" ON "pedido"("estado");

-- CreateIndex
CREATE INDEX "pedido_estado_pago_idx" ON "pedido"("estado_pago");

-- CreateIndex
CREATE INDEX "pedido_correo_cliente_idx" ON "pedido"("correo_cliente");

-- CreateIndex
CREATE INDEX "pedido_fecha_creacion_idx" ON "pedido" USING BRIN ("fecha_creacion");

-- CreateIndex
CREATE INDEX "item_pedido_pedido_id_idx" ON "item_pedido"("pedido_id");

-- CreateIndex
CREATE INDEX "item_pedido_producto_id_idx" ON "item_pedido"("producto_id");

-- CreateIndex
CREATE INDEX "metodo_envio_esta_activo_idx" ON "metodo_envio"("esta_activo");

-- CreateIndex
CREATE INDEX "metodo_pago_usuario_id_idx" ON "metodo_pago"("usuario_id");

-- CreateIndex
CREATE INDEX "metodo_pago_proveedor_idx" ON "metodo_pago"("proveedor");

-- CreateIndex
CREATE INDEX "metodo_pago_es_principal_idx" ON "metodo_pago"("es_principal");

-- CreateIndex
CREATE INDEX "metodo_pago_huella_digital_idx" ON "metodo_pago"("huella_digital");

-- CreateIndex
CREATE INDEX "pago_pedido_id_idx" ON "pago"("pedido_id");

-- CreateIndex
CREATE INDEX "pago_id_intento_pago_idx" ON "pago"("id_intento_pago");

-- CreateIndex
CREATE INDEX "pago_estado_idx" ON "pago"("estado");

-- CreateIndex
CREATE INDEX "pago_fecha_creacion_idx" ON "pago" USING BRIN ("fecha_creacion");

-- CreateIndex
CREATE UNIQUE INDEX "cupon_codigo_key" ON "cupon"("codigo");

-- CreateIndex
CREATE INDEX "cupon_codigo_idx" ON "cupon"("codigo");

-- CreateIndex
CREATE INDEX "cupon_esta_activo_idx" ON "cupon"("esta_activo");

-- CreateIndex
CREATE INDEX "cupon_valido_desde_idx" ON "cupon"("valido_desde");

-- CreateIndex
CREATE INDEX "cupon_valido_hasta_idx" ON "cupon"("valido_hasta");

-- CreateIndex
CREATE UNIQUE INDEX "uso_cupon_pedido_id_key" ON "uso_cupon"("pedido_id");

-- CreateIndex
CREATE INDEX "uso_cupon_cupon_id_idx" ON "uso_cupon"("cupon_id");

-- CreateIndex
CREATE INDEX "uso_cupon_pedido_id_idx" ON "uso_cupon"("pedido_id");

-- CreateIndex
CREATE INDEX "uso_cupon_usuario_id_idx" ON "uso_cupon"("usuario_id");

-- CreateIndex
CREATE INDEX "lista_deseos_usuario_id_idx" ON "lista_deseos"("usuario_id");

-- CreateIndex
CREATE INDEX "item_lista_deseos_lista_deseos_id_idx" ON "item_lista_deseos"("lista_deseos_id");

-- CreateIndex
CREATE INDEX "item_lista_deseos_producto_id_idx" ON "item_lista_deseos"("producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "item_lista_deseos_lista_deseos_id_producto_id_variante_id_key" ON "item_lista_deseos"("lista_deseos_id", "producto_id", "variante_id");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_sitio_clave_key" ON "configuracion_sitio"("clave");

-- CreateIndex
CREATE INDEX "configuracion_sitio_clave_idx" ON "configuracion_sitio"("clave");

-- CreateIndex
CREATE INDEX "configuracion_sitio_es_publica_idx" ON "configuracion_sitio"("es_publica");

-- AddForeignKey
ALTER TABLE "perfil_usuario" ADD CONSTRAINT "perfil_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_oauth" ADD CONSTRAINT "cuenta_oauth_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuenta_oauth" ADD CONSTRAINT "cuenta_oauth_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor_oauth"("proveedor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesion_usuario" ADD CONSTRAINT "sesion_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direccion" ADD CONSTRAINT "direccion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria" ADD CONSTRAINT "categoria_categoria_padre_id_fkey" FOREIGN KEY ("categoria_padre_id") REFERENCES "categoria"("categoria_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categoria"("categoria_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_marca_id_fkey" FOREIGN KEY ("marca_id") REFERENCES "marca"("marca_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "producto" ADD CONSTRAINT "producto_proveedor_id_fkey" FOREIGN KEY ("proveedor_id") REFERENCES "proveedor"("proveedor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variante_producto" ADD CONSTRAINT "variante_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_producto" ADD CONSTRAINT "imagen_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagen_producto" ADD CONSTRAINT "imagen_producto_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("variante_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseña_producto" ADD CONSTRAINT "reseña_producto_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reseña_producto" ADD CONSTRAINT "reseña_producto_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventario" ADD CONSTRAINT "inventario_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("variante_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion_inventario" ADD CONSTRAINT "transaccion_inventario_inventario_id_fkey" FOREIGN KEY ("inventario_id") REFERENCES "inventario"("inventario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaccion_inventario" ADD CONSTRAINT "transaccion_inventario_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito" ADD CONSTRAINT "carrito_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_carrito" ADD CONSTRAINT "item_carrito_carrito_id_fkey" FOREIGN KEY ("carrito_id") REFERENCES "carrito"("carrito_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_carrito" ADD CONSTRAINT "item_carrito_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_carrito" ADD CONSTRAINT "item_carrito_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("variante_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_direccion_facturacion_id_fkey" FOREIGN KEY ("direccion_facturacion_id") REFERENCES "direccion"("direccion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_direccion_envio_id_fkey" FOREIGN KEY ("direccion_envio_id") REFERENCES "direccion"("direccion_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido" ADD CONSTRAINT "pedido_metodo_envio_id_fkey" FOREIGN KEY ("metodo_envio_id") REFERENCES "metodo_envio"("metodo_envio_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("pedido_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_pedido" ADD CONSTRAINT "item_pedido_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("variante_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metodo_pago" ADD CONSTRAINT "metodo_pago_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("pedido_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pago" ADD CONSTRAINT "pago_metodo_pago_id_fkey" FOREIGN KEY ("metodo_pago_id") REFERENCES "metodo_pago"("metodo_pago_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_cupon" ADD CONSTRAINT "uso_cupon_cupon_id_fkey" FOREIGN KEY ("cupon_id") REFERENCES "cupon"("cupon_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_cupon" ADD CONSTRAINT "uso_cupon_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedido"("pedido_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uso_cupon" ADD CONSTRAINT "uso_cupon_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_deseos" ADD CONSTRAINT "lista_deseos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_lista_deseos" ADD CONSTRAINT "item_lista_deseos_lista_deseos_id_fkey" FOREIGN KEY ("lista_deseos_id") REFERENCES "lista_deseos"("lista_deseos_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_lista_deseos" ADD CONSTRAINT "item_lista_deseos_producto_id_fkey" FOREIGN KEY ("producto_id") REFERENCES "producto"("producto_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_lista_deseos" ADD CONSTRAINT "item_lista_deseos_variante_id_fkey" FOREIGN KEY ("variante_id") REFERENCES "variante_producto"("variante_id") ON DELETE SET NULL ON UPDATE CASCADE;
