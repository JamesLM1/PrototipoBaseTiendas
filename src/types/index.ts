export type UserRole = 'superadmin' | 'owner' | 'client';

export type RateType = 'TEA' | 'TNA';

export type CapitalizationFrequency =
  | 'diaria'
  | 'mensual'
  | 'bimestral'
  | 'trimestral'
  | 'cuatrimestral'
  | 'semestral'
  | 'anual';

export type CreditModality = 'FIN_DE_MES' | 'CUOTAS';

export type ClientStatus = 'al_dia' | 'observado_mora' | 'bloqueado' | 'inactivo';

export type BazarStatus = 'activo' | 'baja';

export type LiquidationStatus = 'Pendiente' | 'Pagado' | 'En_Mora';

export type InstallmentStatus = 'Pagada' | 'Proxima' | 'Vencida';

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  bazarId?: string;
  clienteId?: string;
  avatar?: string;
}

export interface Bazar {
  id: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  duenoNombre: string;
  duenoDocumento: string;
  correo: string;
  telefono: string;
  direccion: string;
  distrito: string;
  provincia: string;
  departamento: string;
  estado: BazarStatus;
  fechaAlta: string;
  lineaPorDefecto: number;
  plazoMaxPorDefecto: number;
  diaCorteDefecto: number;
  diaPagoDefecto: number;
}

export interface ClientFinancialConfig {
  moneda: 'PEN' | 'USD';
  lineaCreditoMax: number;
  tipoTasa: RateType;
  tasaCompensatoriaAnual: number; // e.g. 0.24 for 24%
  capitalizacionNominal?: CapitalizationFrequency; // required if tipoTasa === 'TNA'
  tasaMoratoriaAnual: number; // e.g. 0.36 for 36%
  diaCorteMensual: number; // 1 - 28
  horaCorte: string; // e.g. "20:00"
  diaPagoMensual: number; // 1 - 30 (must be > diaCorteMensual by at least 5 days)
  plazoMaximoMeses: number; // 1 - 12
}

export interface Client {
  id: string;
  bazarId: string;
  nombres: string;
  tipoDocumento: 'DNI' | 'RUC' | 'CE';
  numeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  estado: ClientStatus;
  financiero: ClientFinancialConfig;
  creditoUtilizado: number;
  saldoDisponible: number;
  deudaVencida: number;
  fechaRegistro: string;
}

export interface Product {
  id: string;
  bazarId: string;
  sku: string;
  nombre: string;
  descripcion: string;
  marca: string;
  categoria: string;
  proveedor: string;
  unidadMedida: string;
  precioContado: number;
  precioCredito: number;
  modalidadFinDeMes: boolean;
  modalidadCuotas: boolean;
  stockActual: number;
  stockMinimo: number;
  imagen?: string;
}

export interface CartItem {
  producto: Product;
  cantidad: number;
  subtotal: number;
}

export interface PurchaseItem {
  productoId: string;
  nombreProducto: string;
  sku: string;
  cantidad: number;
  precioCreditoUnitario: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  bazarId: string;
  clienteId: string;
  fechaCompra: string; // YYYY-MM-DD
  horaCompra: string; // HH:mm:ss
  items: PurchaseItem[];
  montoTotal: number;
  modalidad: CreditModality;
  numeroCuotas?: number;
  liquidado: boolean;
  cicloCorte: string; // e.g. "2026-09"
}

export interface Liquidation {
  id: string;
  bazarId: string;
  clienteId: string;
  periodo: string; // e.g. "Septiembre 2026"
  fechaCorte: string;
  fechaLimitePago: string;
  comprasIds: string[];
  totalCapital: number;
  interesCompensatorioTotal: number;
  interesMoratorioTotal: number;
  diasMoraTranscurridos: number;
  montoTotalExigible: number;
  estado: LiquidationStatus;
  fechaPagoReal?: string;
}

export interface InstallmentRow {
  numeroCuota: number;
  fechaVencimiento: string;
  saldoInicial: number;
  interes: number;
  amortizacion: number;
  cuota: number;
  saldoFinal: number;
  estado: InstallmentStatus;
  fechaPagoReal?: string;
}

export interface InstallmentLoan {
  id: string;
  bazarId: string;
  clienteId: string;
  compraId: string;
  fechaInicio: string;
  montoOriginal: number;
  diasGraciaTotal: number;
  factorCapitalizacionGracia: number;
  capitalVivoInicial: number; // P' (capitalizado)
  interesGraciaAcumulado: number; // P' - P
  temCompensatoria: number;
  numeroCuotas: number;
  montoCuotaFija: number;
  cronograma: InstallmentRow[];
  totalInteresesProyectados: number;
  saldoPendienteActual: number;
  cuotasPagadas: number;
  proximaCuotaVencimiento: string;
  proximaCuotaMonto: number;
  estado: 'Al_Dia' | 'En_Mora' | 'Cancelado';
}

export interface PaymentPrelacion {
  mora: number;
  interesCompensatorio: number;
  capital: number;
}

export interface PaymentRecord {
  id: string;
  bazarId: string;
  clienteId: string;
  tipoObligacion: 'Fin_De_Mes' | 'Cuota';
  referenciaId: string; // liquidationId or loanId
  numeroCuota?: number;
  fechaPago: string;
  montoPagado: number;
  prelacion: PaymentPrelacion;
  metodoPago: 'Efectivo' | 'Transferencia' | 'Yape/Plin';
  nroOperacion?: string;
  comprobanteUrl?: string;
  registradoPor: string;
}

export interface AuditLog {
  id: string;
  bazarId?: string;
  fechaHora: string;
  usuario: string;
  rol: UserRole;
  accion: string;
  modulo: string;
  registro: string;
  resultado: 'Exitoso' | 'Fallido';
  valorAnterior?: string;
  valorNuevo?: string;
  ip?: string;
}

export interface HelpTopic {
  id: string;
  titulo: string;
  definicion: string;
  normativa?: string;
  ejemplo?: string;
  formula?: string;
}
