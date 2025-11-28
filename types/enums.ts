export enum TipoGenero {
  MASCULINO = 'masculino',
  FEMENINO = 'femenino',
  OTRO = 'otro',
  PREFIERE_NO_DECIR = 'prefiere_no_decir'
}

export enum TipoDireccion {
  FACTURACION = 'facturacion',
  ENVIO = 'envio',
  AMBOS = 'ambos'
}

export enum EstadoPedido {
  PENDIENTE = 'pendiente',
  CONFIRMADO = 'confirmado',
  PROCESANDO = 'procesando',
  ENVIADO = 'enviado',
  ENTREGADO = 'entregado',
  CANCELADO = 'cancelado',
  REEMBOLSADO = 'reembolsado'
}

export enum EstadoPago {
  PENDIENTE = 'pendiente',
  PROCESANDO = 'procesando',
  PAGADO = 'pagado',
  FALLIDO = 'fallido',
  REEMBOLSADO = 'reembolsado',
  PARCIALMENTE_REEMBOLSADO = 'parcialmente_reembolsado'
}

export enum EstadoFulfillment {
  NO_COMPLETADO = 'no_completado',
  PARCIALMENTE_COMPLETADO = 'parcialmente_completado',
  COMPLETADO = 'completado'
}

export enum TipoTransaccionInventario {
  COMPRA = 'compra',
  DEVOLUCION = 'devolucion',
  AJUSTE = 'ajuste',
  DANADO = 'danado',
  RECIBIDO = 'recibido',
  RESERVADO = 'reservado',
  LIBERADO = 'liberado'
}

export enum TipoReferencia {
  PEDIDO = 'pedido',
  AJUSTE = 'ajuste',
  DEVOLUCION = 'devolucion',
  TRANSFERENCIA = 'transferencia'
}

export enum CodigoMoneda {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  MXN = 'MXN'
}

export enum ProveedorPago {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
  SQUARE = 'square'
}

export enum TipoMetodoPago {
  TARJETA = 'tarjeta',
  PAYPAL = 'paypal',
  TRANSFERENCIA_BANCARIA = 'transferencia_bancaria',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay'
}

export enum MarcaTarjeta {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMERICAN_EXPRESS = 'american_express',
  DISCOVER = 'discover',
  DINERS_CLUB = 'diners_club',
  JCB = 'jcb',
  UNIONPAY = 'unionpay'
}

export enum TipoDescuento {
  PORCENTAJE = 'porcentaje',
  MONTO_FIJO = 'monto_fijo',
  ENVIO_GRATUITO = 'envio_gratuito'
}

export enum TipoDatoConfiguracion {
  TEXTO = 'texto',
  NUMERO = 'numero',
  BOOLEANO = 'booleano',
  JSON = 'json',
  ARREGLO = 'arreglo'
}