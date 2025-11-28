export interface EstadisticasVentas {
  totalVentas: number;
  totalPedidos: number;
  promedioPedido: number;
  totalDescuentos: number;
  totalEnvio: number;
  totalImpuestos: number;
}

export interface VentaPorDia {
  fecha_creacion: Date;
  _sum: {
    monto_total: number;
  };
  _count: {
    pedido_id: number;
  };
}

export interface ProductoMasVendido {
  producto_id: string;
  _sum: {
    cantidad: number;
    precio_total: number;
  };
}

export interface ReporteVentas {
  estadisticas: EstadisticasVentas;
  ventasPorDia: VentaPorDia[];
  productosMasVendidos: ProductoMasVendido[];
}

export interface FiltroReporte {
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: string[];
}