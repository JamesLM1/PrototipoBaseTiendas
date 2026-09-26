import {
  CapitalizationFrequency,
  InstallmentRow,
  RateType,
} from '../types';

/**
 * Convenciones Oficiales:
 * - Ley N.º 26702, Art. 9: Año comercial de 360 días y meses uniformes de 30 días.
 * - Resolución SBS N.º 8181-2012: Transparencia y desglose exacto de liquidaciones y cronogramas.
 * - Método de Amortización: Francés vencido simple ordinario con base 360/30.
 * - Precisión de tasas: Mínimo 7 decimales.
 * - Precisión monetaria: 2 decimales (PEN / USD).
 */

export const FREQUENCY_FACTORS: Record<CapitalizationFrequency, number> = {
  diaria: 360,
  mensual: 12,
  bimestral: 6,
  trimestral: 4,
  cuatrimestral: 3,
  semestral: 2,
  anual: 1,
};

/**
 * Convierte TNA con periodicidad de capitalización m a TEA
 * TEA = (1 + TNA / m)^m - 1
 */
export function tnaToTea(tna: number, freq: CapitalizationFrequency): number {
  const m = FREQUENCY_FACTORS[freq] || 360;
  return Math.pow(1 + tna / m, m) - 1;
}

/**
 * Convierte TEA a TED (Tasa Efectiva Diaria) con base 360 días
 * TED = (1 + TEA)^(1 / 360) - 1
 */
export function teaToTed(tea: number): number {
  return Math.pow(1 + tea, 1 / 360) - 1;
}

/**
 * Convierte TEA a TEM (Tasa Efectiva Mensual comercial de 30 días)
 * TEM = (1 + TEA)^(30 / 360) - 1
 */
export function teaToTem(tea: number): number {
  return Math.pow(1 + tea, 30 / 360) - 1;
}

/**
 * Obtiene la TEA efectiva a partir del tipo de tasa ingresado
 */
export function resolveEffectiveAnnualRate(
  tipoTasa: RateType,
  tasa: number,
  capitalizacion?: CapitalizationFrequency
): {
  tea: number;
  ted: number;
  tem: number;
  formulaExplicacion: string;
} {
  let tea: number;
  let formulaExplicacion: string;

  if (tipoTasa === 'TEA') {
    tea = tasa;
    formulaExplicacion = `Tasa pactada directamente como TEA: ${(tea * 100).toFixed(7)}%`;
  } else {
    const freq = capitalizacion || 'diaria';
    const m = FREQUENCY_FACTORS[freq];
    tea = tnaToTea(tasa, freq);
    formulaExplicacion = `Conversión de TNA ${(tasa * 100).toFixed(7)}% con capitalización ${freq} (m = ${m}): TEA = (1 + ${(tasa * 100).toFixed(4)}% / ${m})^${m} - 1 = ${(tea * 100).toFixed(7)}%`;
  }

  const ted = teaToTed(tea);
  const tem = teaToTem(tea);

  return { tea, ted, tem, formulaExplicacion };
}

/**
 * Formatea valores monetarios a 2 decimales
 */
export function formatCurrency(amount: number, currency: 'PEN' | 'USD' = 'PEN'): string {
  const symbol = currency === 'PEN' ? 'S/' : '$';
  return `${symbol} ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formatea tasas porcentuales con mínimo 7 decimales según el requerimiento académico
 */
export function formatRatePercent(rateDecimal: number, decimals = 7): string {
  const percent = rateDecimal * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Diferencia en días entre dos fechas (YYYY-MM-DD)
 */
export function getDaysDiff(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Cálculo para Modalidad Fin de Mes
 */
export interface FinDeMesCalculationResult {
  capital: number;
  diasCompensatorios: number;
  tedCompensatoria: number;
  interesCompensatorio: number;
  diasMora: number;
  tedMoratoria: number;
  interesMoratorio: number;
  montoTotalExigible: number;
  fechaCompra: string;
  fechaLimitePago: string;
  fechaPagoReal: string;
}

export function calculateFinDeMesPurchase(params: {
  capital: number;
  fechaCompra: string;
  fechaLimitePago: string;
  fechaPagoReal?: string;
  tedCompensatoria: number;
  tedMoratoria: number;
}): FinDeMesCalculationResult {
  const { capital, fechaCompra, fechaLimitePago, tedCompensatoria, tedMoratoria } = params;
  const fechaPagoReal = params.fechaPagoReal || fechaLimitePago;

  const diasCompensatorios = Math.max(0, getDaysDiff(fechaCompra, fechaLimitePago));
  // Interés ordinario compensatorio: I = Capital * ((1 + TED)^dias - 1)
  const factorComp = Math.pow(1 + tedCompensatoria, diasCompensatorios) - 1;
  const interesCompensatorio = roundMoney(capital * factorComp);

  const diasMora = Math.max(0, getDaysDiff(fechaLimitePago, fechaPagoReal));
  let interesMoratorio = 0;
  if (diasMora > 0) {
    // Interés moratorio sobre el saldo vencido: (Capital + Interés Compensatorio) * ((1 + TED_mora)^dias_mora - 1)
    const baseMora = capital + interesCompensatorio;
    const factorMora = Math.pow(1 + tedMoratoria, diasMora) - 1;
    interesMoratorio = roundMoney(baseMora * factorMora);
  }

  const montoTotalExigible = roundMoney(capital + interesCompensatorio + interesMoratorio);

  return {
    capital,
    diasCompensatorios,
    tedCompensatoria,
    interesCompensatorio,
    diasMora,
    tedMoratoria,
    interesMoratorio,
    montoTotalExigible,
    fechaCompra,
    fechaLimitePago,
    fechaPagoReal,
  };
}

/**
 * Aplicación de prelación de pagos (Orden de prelación obligatorio):
 * 1. Mora
 * 2. Interés compensatorio
 * 3. Capital
 */
export function calculatePaymentPrelacion(
  montoPagado: number,
  moraExigible: number,
  interesCompExigible: number,
  capitalExigible: number
): {
  mora: number;
  interesCompensatorio: number;
  capital: number;
  totalAplicado: number;
} {
  let remanente = montoPagado;

  const mora = Math.min(remanente, moraExigible);
  remanente -= mora;

  const interesCompensatorio = Math.min(remanente, interesCompExigible);
  remanente -= interesCompensatorio;

  const capital = Math.min(remanente, capitalExigible);
  remanente -= capital;

  return {
    mora: roundMoney(mora),
    interesCompensatorio: roundMoney(interesCompensatorio),
    capital: roundMoney(capital),
    totalAplicado: roundMoney(mora + interesCompensatorio + capital),
  };
}

/**
 * Cálculo del Método Francés Vencido Simple Ordinario con Período de Gracia Total Inicial
 */
export interface FrenchLoanCalculationResult {
  montoOriginal: number;
  diasGraciaTotal: number;
  factorCapitalizacionGracia: number;
  capitalVivoInicial: number; // P' (capitalizado)
  interesGraciaAcumulado: number; // P' - P
  tem: number;
  ted: number;
  numeroCuotas: number;
  factorRecuperacionCapital: number;
  montoCuotaFija: number;
  totalInteresesProyectados: number;
  cronograma: InstallmentRow[];
}

export function calculateFrenchLoan(params: {
  montoOriginal: number;
  fechaCompra: string;
  fechaPrimerCorte: string;
  diaPagoMensual: number;
  tedCompensatoria: number;
  temCompensatoria: number;
  numeroCuotas: number;
}): FrenchLoanCalculationResult {
  const {
    montoOriginal,
    fechaCompra,
    fechaPrimerCorte,
    diaPagoMensual,
    tedCompensatoria,
    temCompensatoria,
    numeroCuotas,
  } = params;

  // 1. Días de gracia total transcurridos hasta el primer corte
  const diasGraciaTotal = Math.max(0, getDaysDiff(fechaCompra, fechaPrimerCorte));

  // 2. Factor de capitalización durante el período de gracia total: (1 + TED)^dias_gracia
  const factorCapitalizacionGracia = Math.pow(1 + tedCompensatoria, diasGraciaTotal);
  
  // 3. Capital vivo inicial capitalizado: P' = P * (1 + TED)^dias_gracia
  const capitalVivoInicial = roundMoney(montoOriginal * factorCapitalizacionGracia);
  const interesGraciaAcumulado = roundMoney(capitalVivoInicial - montoOriginal);

  // 4. Factor de Recuperación del Capital (FRC): [TEM * (1 + TEM)^n] / [(1 + TEM)^n - 1]
  const temPow = Math.pow(1 + temCompensatoria, numeroCuotas);
  const factorRecuperacionCapital = (temCompensatoria * temPow) / (temPow - 1);

  // 5. Cuota periódica uniforme francesa: C = P' * FRC
  const montoCuotaFija = roundMoney(capitalVivoInicial * factorRecuperacionCapital);

  // 6. Generación del Cronograma de Pagos
  const cronograma: InstallmentRow[] = [];
  let saldoDeudor = capitalVivoInicial;
  let totalIntereses = 0;

  // Fecha base para cuotas (mensual consecutiva)
  const primerCorteDate = new Date(fechaPrimerCorte + 'T00:00:00');
  let currentYear = primerCorteDate.getFullYear();
  let currentMonth = primerCorteDate.getMonth(); // 0-indexed

  for (let k = 1; k <= numeroCuotas; k++) {
    // Siguiente mes para la fecha de pago de la cuota k
    currentMonth += 1;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear += 1;
    }
    const payDate = new Date(currentYear, currentMonth, Math.min(diaPagoMensual, 28));
    const fechaVencimiento = payDate.toISOString().split('T')[0];

    const saldoInicial = roundMoney(saldoDeudor);
    const interes = roundMoney(saldoInicial * temCompensatoria);
    totalIntereses += interes;

    let amortizacion: number;
    let cuota: number;
    let saldoFinal: number;

    if (k === numeroCuotas) {
      // Ajuste de cierre para la última cuota para exactitud a cero
      amortizacion = saldoInicial;
      cuota = roundMoney(amortizacion + interes);
      saldoFinal = 0.0;
    } else {
      cuota = montoCuotaFija;
      amortizacion = roundMoney(cuota - interes);
      saldoFinal = roundMoney(saldoInicial - amortizacion);
    }

    saldoDeudor = saldoFinal;

    cronograma.push({
      numeroCuota: k,
      fechaVencimiento,
      saldoInicial,
      interes,
      amortizacion,
      cuota,
      saldoFinal,
      estado: k === 1 ? 'Proxima' : 'Proxima',
    });
  }

  return {
    montoOriginal,
    diasGraciaTotal,
    factorCapitalizacionGracia,
    capitalVivoInicial,
    interesGraciaAcumulado,
    tem: temCompensatoria,
    ted: tedCompensatoria,
    numeroCuotas,
    factorRecuperacionCapital,
    montoCuotaFija,
    totalInteresesProyectados: roundMoney(totalIntereses),
    cronograma,
  };
}

export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
