import React, { useState } from 'react';
import {
  CreditCard,
  ShoppingCart,
  CalendarDays,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Eye,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatRatePercent } from '../../utils/finance';

interface ClientPortalProps {
  initialTab?: string;
}

export const ClientPortal: React.FC<ClientPortalProps> = ({ initialTab = 'dashboard' }) => {
  const { currentClient, currentBazar, purchases, liquidations, installmentLoans, payments } = useApp();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const clientPurchases = purchases.filter((p) => p.clienteId === currentClient.id);
  const clientLiquidations = liquidations.filter((l) => l.clienteId === currentClient.id);
  const clientLoans = installmentLoans.filter((l) => l.clienteId === currentClient.id);
  const clientPayments = payments.filter((p) => p.clienteId === currentClient.id);

  // Next payment computation
  const pendingLiq = clientLiquidations.find((l) => l.estado !== 'Pagado');
  const activeLoan = clientLoans.find((l) => l.cronograma.some((r) => r.estado !== 'Pagada'));
  const nextCuota = activeLoan?.cronograma.find((r) => r.estado !== 'Pagada');

  const usedPct = Math.round(
    (currentClient.creditoUtilizado / (currentClient.financiero.lineaCreditoMax || 1)) * 100
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Profile Greeting */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Portal del Cliente Comercial
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 font-mono">
              {currentClient.tipoDocumento}: {currentClient.numeroDocumento}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Hola, {currentClient.nombres}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Estado de cuenta y control de crédito directo en {currentBazar.nombreComercial}
          </p>
        </div>

        <div>
          {currentClient.estado === 'al_dia' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
              <span>Línea Activa y al Día</span>
            </span>
          )}
          {currentClient.estado === 'observado_mora' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>Obligación Vencida en Mora</span>
            </span>
          )}
        </div>
      </div>

      {/* Delinquency alert if any */}
      {currentClient.estado === 'observado_mora' && (
        <div className="bg-rose-50 border border-rose-300 p-4 rounded-xl text-rose-900 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>AVISO DE PAGO VENCIDO</span>
          </div>
          <p className="leading-relaxed text-rose-700">
            Mantiene un saldo vencido de <strong>{formatCurrency(currentClient.deudaVencida)}</strong>.
            Para rehabilitar su capacidad de compra, por favor acérquese al bazar para cancelar su
            liquidación pendiente.
          </p>
        </div>
      )}

      {/* Client Subnavigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Resumen General' },
          { id: 'credito', label: 'Mi Línea de Crédito' },
          { id: 'compras', label: `Mis Compras (${clientPurchases.length})` },
          { id: 'cuotas', label: `Mis Cuotas (${clientLoans.length})` },
          { id: 'pagos', label: `Mis Pagos (${clientPayments.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: RESUMEN / DASHBOARD CLIENTE (P100) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* 4 Main Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Línea Aprobada</span>
              <span className="text-xl font-bold font-mono text-slate-900 block mt-0.5">
                {formatCurrency(currentClient.financiero.lineaCreditoMax)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Crédito Utilizado</span>
              <span className="text-xl font-bold font-mono text-indigo-700 block mt-0.5">
                {formatCurrency(currentClient.creditoUtilizado)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Crédito Disponible</span>
              <span className="text-xl font-bold font-mono text-emerald-700 block mt-0.5">
                {formatCurrency(currentClient.saldoDisponible)}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] text-slate-500 block">Deuda Vencida</span>
              <span className="text-xl font-bold font-mono text-rose-700 block mt-0.5">
                {formatCurrency(currentClient.deudaVencida)}
              </span>
            </div>
          </div>

          {/* Line Utilization Progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>Porcentaje de Crédito Ocupado</span>
              <span className="font-mono">{usedPct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${
                  usedPct > 80 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, usedPct)}%` }}
              />
            </div>
          </div>

          {/* Próximo Pago Destacado */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Próxima Obligación por Cancelar
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                Corte mensual: Día {currentClient.financiero.diaCorteMensual}
              </span>
            </div>

            {pendingLiq ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-slate-400 block text-xs">Concepto</span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    Liquidación {pendingLiq.periodo}
                  </span>
                  <span className="text-xs text-slate-400">Modalidad Fin de Mes</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Fecha Límite de Pago</span>
                  <span className="font-mono text-base font-bold text-white block mt-0.5">
                    {pendingLiq.fechaLimitePago}
                  </span>
                  {pendingLiq.estado === 'En_Mora' ? (
                    <span className="text-xs text-rose-400 font-semibold">
                      ¡Vencido hace {pendingLiq.diasMoraTranscurridos} días!
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-400">Vigente sin mora</span>
                  )}
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-400 block text-xs">Monto Total Exigible</span>
                  <span className="font-mono text-2xl font-black text-white block mt-0.5">
                    {formatCurrency(pendingLiq.montoTotalExigible)}
                  </span>
                  <span className="text-[10px] text-slate-400">Incluye interés compensatorio</span>
                </div>
              </div>
            ) : nextCuota ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <span className="text-slate-400 block text-xs">Concepto</span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    Cuota {nextCuota.numeroCuota} de {activeLoan?.numeroCuotas}
                  </span>
                  <span className="text-xs text-slate-400">Método Francés Vencido</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Fecha de Vencimiento</span>
                  <span className="font-mono text-base font-bold text-white block mt-0.5">
                    {nextCuota.fechaVencimiento}
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-slate-400 block text-xs">Monto Cuota Fija</span>
                  <span className="font-mono text-2xl font-black text-white block mt-0.5">
                    {formatCurrency(nextCuota.cuota)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-slate-400 text-xs">
                ¡Felicidades! No cuenta con obligaciones pendientes de pago.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MI CRÉDITO (Modo lectura) */}
      {activeTab === 'credito' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Condiciones Contractuales del Crédito
            </h3>
            <p className="text-slate-500">
              Parámetros regulados bajo la Ley N.º 26702, Art. 9 y Resolución SBS N.º 8181-2012
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Línea Aprobada:</span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {formatCurrency(currentClient.financiero.lineaCreditoMax)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Moneda:</span>
              <span className="text-sm font-bold text-slate-900">
                {currentClient.financiero.moneda === 'PEN' ? 'Soles (PEN - S/)' : 'Dólares (USD)'}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Tasa Compensatoria Ordinaria:</span>
              <span className="text-sm font-bold font-mono text-indigo-700">
                {currentClient.financiero.tipoTasa}{' '}
                {formatRatePercent(currentClient.financiero.tasaCompensatoriaAnual, 4)}
              </span>
              {currentClient.financiero.capitalizacionNominal && (
                <span className="text-[10px] text-slate-500 block">
                  Capitalización {currentClient.financiero.capitalizacionNominal}
                </span>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Tasa Moratoria Anual:</span>
              <span className="text-sm font-bold font-mono text-rose-700">
                TEA {formatRatePercent(currentClient.financiero.tasaMoratoriaAnual, 4)}
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Día y Hora de Corte:</span>
              <span className="text-sm font-bold text-slate-900">
                Día {currentClient.financiero.diaCorteMensual} ({currentClient.financiero.horaCorte} hrs)
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Día Límite de Pago Mensual:</span>
              <span className="text-sm font-bold text-slate-900">
                Día {currentClient.financiero.diaPagoMensual} de cada mes
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MIS COMPRAS */}
      {activeTab === 'compras' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Historial de Compras al Crédito
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Artículos Adquiridos</th>
                  <th className="px-4 py-3 text-center">Modalidad</th>
                  <th className="px-4 py-3 text-right">Importe Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No registra compras al crédito en su cuenta.
                    </td>
                  </tr>
                ) : (
                  clientPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono text-slate-600">
                        {p.fechaCompra} <span className="text-[10px] text-slate-400">{p.horaCompra}</span>
                      </td>
                      <td className="px-4 py-3">
                        {p.items.map((it) => (
                          <div key={it.sku} className="text-slate-800 font-medium">
                            {it.cantidad}x {it.nombreProducto}
                          </div>
                        ))}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                          {p.modalidad === 'FIN_DE_MES' ? 'Fin de Mes' : `${p.numeroCuotas} Cuotas`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(p.montoTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MIS CUOTAS */}
      {activeTab === 'cuotas' && (
        <div className="space-y-4">
          {clientLoans.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              No tiene compras activas financiadas en cuotas.
            </div>
          ) : (
            clientLoans.map((loan) => (
              <div key={loan.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Crédito en Cuotas #{loan.id}</span>
                    <span className="text-[11px] text-slate-500">
                      {loan.numeroCuotas} cuotas de {formatCurrency(loan.montoCuotaFija)} · Saldo: {formatCurrency(loan.saldoPendienteActual)}
                    </span>
                  </div>
                  <span className="font-mono text-indigo-700 font-semibold">
                    TEM: {formatRatePercent(loan.temCompensatoria, 4)}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="px-3 py-2 text-center">#</th>
                        <th className="px-3 py-2">Vencimiento</th>
                        <th className="px-3 py-2 text-right">Interés</th>
                        <th className="px-3 py-2 text-right">Amortización</th>
                        <th className="px-3 py-2 text-right">Cuota Fija</th>
                        <th className="px-3 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {loan.cronograma.map((row) => (
                        <tr key={row.numeroCuota} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 text-center font-bold text-indigo-700">{row.numeroCuota}</td>
                          <td className="px-3 py-2 font-sans text-slate-700">{row.fechaVencimiento}</td>
                          <td className="px-3 py-2 text-right text-slate-600">{formatCurrency(row.interes)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700 font-medium">{formatCurrency(row.amortizacion)}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">{formatCurrency(row.cuota)}</td>
                          <td className="px-3 py-2 text-center font-sans">
                            {row.estado === 'Pagada' && (
                              <span className="text-emerald-700 font-medium">✔ Pagada</span>
                            )}
                            {row.estado === 'Proxima' && (
                              <span className="text-amber-700 font-medium">● Próxima</span>
                            )}
                            {row.estado === 'Vencida' && (
                              <span className="text-rose-700 font-bold">⚠ Vencida</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: MIS PAGOS */}
      {activeTab === 'pagos' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Comprobantes y Pagos Efectuados
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Fecha de Pago</th>
                  <th className="px-4 py-3">Tipo de Obligación</th>
                  <th className="px-4 py-3">Operación / Medio</th>
                  <th className="px-4 py-3 text-right">Mora Aplicada</th>
                  <th className="px-4 py-3 text-right">Interés Aplicado</th>
                  <th className="px-4 py-3 text-right">Capital Amortizado</th>
                  <th className="px-4 py-3 text-right">Total Pagado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {clientPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-sans">
                      Aún no registra pagos efectuados en el sistema.
                    </td>
                  </tr>
                ) : (
                  clientPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-slate-700">{pay.fechaPago}</td>
                      <td className="px-4 py-3 font-sans text-slate-800 font-medium">
                        {pay.tipoObligacion === 'Fin_De_Mes' ? 'Liquidación Fin de Mes' : `Cuota ${pay.numeroCuota}`}
                      </td>
                      <td className="px-4 py-3 font-sans text-slate-600">
                        {pay.metodoPago} <span className="text-[10px] text-slate-400 font-mono">({pay.nroOperacion})</span>
                      </td>
                      <td className="px-4 py-3 text-right text-rose-600">
                        {formatCurrency(pay.prelacion.mora)}
                      </td>
                      <td className="px-4 py-3 text-right text-indigo-700">
                        {formatCurrency(pay.prelacion.interesCompensatorio)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-700 font-medium">
                        {formatCurrency(pay.prelacion.capital)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-950">
                        {formatCurrency(pay.montoPagado)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
