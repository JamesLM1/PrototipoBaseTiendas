import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Printer,
  ArrowRight,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Liquidation, Purchase } from '../../types';
import {
  calculateFinDeMesPurchase,
  formatCurrency,
  formatRatePercent,
  resolveEffectiveAnnualRate,
} from '../../utils/finance';

interface AccountStatementsProps {
  onNavigateToPayment?: (liquidationId: string) => void;
  filterClientId?: string;
}

export const AccountStatements: React.FC<AccountStatementsProps> = ({
  onNavigateToPayment,
  filterClientId,
}) => {
  const { liquidations, clients, purchases, currentBazar, openCalculationDetail } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'todos' | 'Pendiente' | 'Pagado' | 'En_Mora'>('todos');
  const [selectedLiquidation, setSelectedLiquidation] = useState<Liquidation | null>(null);

  const bazarLiquidations = liquidations.filter(
    (l) =>
      l.bazarId === currentBazar.id &&
      (!filterClientId || l.clienteId === filterClientId)
  );

  const filtered = bazarLiquidations.filter((l) => {
    const client = clients.find((c) => c.id === l.clienteId);
    const matchesSearch =
      client?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.numeroDocumento.includes(searchTerm) ||
      l.periodo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesState = filterState === 'todos' ? true : l.estado === filterState;

    return matchesSearch && matchesState;
  });

  const handleOpenMathAudit = (liq: Liquidation) => {
    const client = clients.find((c) => c.id === liq.clienteId);
    if (!client) return;

    openCalculationDetail({
      titulo: `Liquidación de Cuenta Corriente — ${liq.periodo}`,
      modalidad: 'FIN_DE_MES',
      clienteNombre: client.nombres,
      datosEntrada: {
        periodoFacturacion: liq.periodo,
        fechaCorte: liq.fechaCorte,
        fechaLimitePago: liq.fechaLimitePago,
        tasaCompensatoria: `${client.financiero.tipoTasa} ${(client.financiero.tasaCompensatoriaAnual * 100).toFixed(4)}%`,
        tasaMoratoriaAnual: `${(client.financiero.tasaMoratoriaAnual * 100).toFixed(4)}% TEA`,
        diasMora: `${liq.diasMoraTranscurridos} días`,
      },
      pasos: [
        {
          paso: '1. Agrupación y Consolidación de Capital',
          descripcion: 'Compras efectuadas con anterioridad a la fecha y hora de corte del ciclo.',
          resultado: formatCurrency(liq.totalCapital),
        },
        {
          paso: '2. Sumatoria de Intereses Compensatorios Ordinarios',
          descripcion: 'Calculados individualmente desde cada fecha de compra hasta la fecha de pago pactada.',
          formula: 'Sum(Capital_i × ((1 + TED)^días_i - 1))',
          resultado: formatCurrency(liq.interesCompensatorioTotal),
        },
        {
          paso: '3. Liquidación de Intereses Moratorios (si existe retraso)',
          descripcion: 'Liquidado de forma independiente sobre la deuda vencida por los días de mora transcurridos.',
          formula: 'Mora = (Capital + I_c) × ((1 + TED_mora)^días_atraso - 1)',
          resultado: formatCurrency(liq.interesMoratorioTotal),
        },
        {
          paso: '4. Monto Total Exigible Consolidado',
          descripcion: 'Importe íntegro adeudado requerido para extinguir la obligación líquida.',
          formula: 'Total = Capital + I_c + Mora',
          resultado: formatCurrency(liq.montoTotalExigible),
        },
      ],
      resumenFinal: {
        totalCapital: formatCurrency(liq.totalCapital),
        interesCompensatorio: formatCurrency(liq.interesCompensatorioTotal),
        interesMoratorio: formatCurrency(liq.interesMoratorioTotal),
        totalExigible: formatCurrency(liq.montoTotalExigible),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Cuentas Corrientes Comerciales (Fin de Mes)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Liquidación mensual de consumos, corte periódico y desglose de intereses compensatorios y de mora
          </p>
        </div>
      </div>

      {/* Filter and search */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, documento o período..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Estado:</span>
          {(['todos', 'Pendiente', 'Pagado', 'En_Mora'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterState === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'En_Mora' ? 'En Mora' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Liquidations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Período / Ciclo</th>
                <th className="px-4 py-3 text-right">Capital Facturado</th>
                <th className="px-4 py-3 text-right">Int. Compensatorio</th>
                <th className="px-4 py-3 text-right">Mora Devengada</th>
                <th className="px-4 py-3 text-right">Total Exigible</th>
                <th className="px-4 py-3">Fecha Límite</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron liquidaciones de cuentas corrientes registradas.
                  </td>
                </tr>
              ) : (
                filtered.map((liq) => {
                  const client = clients.find((c) => c.id === liq.clienteId);

                  return (
                    <tr key={liq.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">
                          {client?.nombres || 'Cliente'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {client?.tipoDocumento}: {client?.numeroDocumento}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 block">{liq.periodo}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Corte: {liq.fechaCorte}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">
                        {formatCurrency(liq.totalCapital)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-indigo-700 font-medium">
                        {formatCurrency(liq.interesCompensatorioTotal)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {liq.interesMoratorioTotal > 0 ? (
                          <span className="text-rose-600 font-bold">
                            {formatCurrency(liq.interesMoratorioTotal)}
                            <span className="block text-[10px] font-normal">
                              ({liq.diasMoraTranscurridos}d mora)
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">S/ 0.00</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-950 text-sm">
                        {formatCurrency(liq.montoTotalExigible)}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {liq.fechaLimitePago}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {liq.estado === 'Pagado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Pagado</span>
                          </span>
                        )}
                        {liq.estado === 'Pendiente' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Pendiente
                          </span>
                        )}
                        {liq.estado === 'En_Mora' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                            <AlertTriangle className="w-3 h-3" />
                            <span>En Mora</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedLiquidation(liq)}
                            title="Ver Estado de Cuenta detallado"
                            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Estado Cta.</span>
                          </button>
                          {liq.estado !== 'Pagado' && onNavigateToPayment && (
                            <button
                              onClick={() => onNavigateToPayment(liq.id)}
                              title="Registrar abono total"
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors inline-flex items-center gap-1"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Cobrar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL P51: Estado de Cuenta Detallado */}
      {selectedLiquidation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 space-y-6 text-xs">
            {/* Header with store details */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block tracking-wider">
                  ESTADO DE CUENTA CORRIENTE COMERCIAL · SBS N.º 8181-2012
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {currentBazar.nombreComercial}
                </h3>
                <p className="text-slate-500 font-mono text-[11px]">
                  RUC: {currentBazar.ruc} · {currentBazar.direccion}, {currentBazar.distrito}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-900 block">
                  Período: {selectedLiquidation.periodo}
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Fecha de Corte: {selectedLiquidation.fechaCorte}
                </span>
                <span className="text-[11px] text-slate-500 block font-mono">
                  Fecha Límite: {selectedLiquidation.fechaLimitePago}
                </span>
              </div>
            </div>

            {/* Client summary strip */}
            {(() => {
              const c = clients.find((x) => x.id === selectedLiquidation.clienteId);
              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Titular:</span>
                    <span className="font-bold text-slate-900">{c?.nombres}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Documento:</span>
                    <span className="font-mono text-slate-700">{c?.tipoDocumento}: {c?.numeroDocumento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Línea Autorizada:</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatCurrency(c?.financiero.lineaCreditoMax || 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Condición:</span>
                    <span className="capitalize font-semibold text-indigo-700">{selectedLiquidation.estado}</span>
                  </div>
                </div>
              );
            })()}

            {/* Purchases Chronological Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Consumos del Período (Orden Cronológico Obligatorio)
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2">Fecha</th>
                      <th className="px-3 py-2">Artículos Adquiridos</th>
                      <th className="px-3 py-2 text-right">Capital</th>
                      <th className="px-3 py-2 text-right">Días Comp.</th>
                      <th className="px-3 py-2 text-right">Tasa Aplicada (TED)</th>
                      <th className="px-3 py-2 text-right">Interés Comp.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedLiquidation.comprasIds.map((pId) => {
                      const p = purchases.find((x) => x.id === pId);
                      const c = clients.find((x) => x.id === selectedLiquidation.clienteId);
                      if (!p || !c) return null;

                      const rates = resolveEffectiveAnnualRate(
                        c.financiero.tipoTasa,
                        c.financiero.tasaCompensatoriaAnual,
                        c.financiero.capitalizacionNominal
                      );
                      const moraRates = resolveEffectiveAnnualRate('TEA', c.financiero.tasaMoratoriaAnual);

                      const calc = calculateFinDeMesPurchase({
                        capital: p.montoTotal,
                        fechaCompra: p.fechaCompra,
                        fechaLimitePago: selectedLiquidation.fechaLimitePago,
                        tedCompensatoria: rates.ted,
                        tedMoratoria: moraRates.ted,
                      });

                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 font-sans text-slate-700">
                            {p.fechaCompra} <span className="text-[10px] text-slate-400">{p.horaCompra}</span>
                          </td>
                          <td className="px-3 py-2.5 font-sans">
                            {p.items.map((it) => (
                              <div key={it.sku} className="text-slate-800">
                                {it.cantidad}x {it.nombreProducto}
                              </div>
                            ))}
                          </td>
                          <td className="px-3 py-2.5 text-right font-medium text-slate-900">
                            {formatCurrency(p.montoTotal)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-600">
                            {calc.diasCompensatorios} d
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-500 text-[11px]">
                            {formatRatePercent(calc.tedCompensatoria, 7)}
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-indigo-700">
                            {formatCurrency(calc.interesCompensatorio)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEPARATE MORA SECTION IF OVERDUE (MANDATORY ENUNCIADO REQUIREMENT) */}
            {selectedLiquidation.interesMoratorioTotal > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-rose-950">
                <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>LIQUIDACIÓN INDEPENDIENTE DE INTERÉS MORATORIO POR RETRASO</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-rose-700 block text-[10px]">Fecha Límite Pactada:</span>
                    <span className="font-mono font-medium">{selectedLiquidation.fechaLimitePago}</span>
                  </div>
                  <div>
                    <span className="text-rose-700 block text-[10px]">Días de Atraso en Mora:</span>
                    <span className="font-mono font-bold">{selectedLiquidation.diasMoraTranscurridos} días calendario</span>
                  </div>
                  <div>
                    <span className="text-rose-700 block text-[10px]">Base Vencida Sujeta a Mora:</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(selectedLiquidation.totalCapital + selectedLiquidation.interesCompensatorioTotal)}
                    </span>
                  </div>
                  <div>
                    <span className="text-rose-700 block text-[10px]">Mora Devengada:</span>
                    <span className="font-mono font-bold text-rose-800 text-sm">
                      {formatCurrency(selectedLiquidation.interesMoratorioTotal)}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-rose-700 pt-1 leading-normal">
                  De conformidad con la Ley N.º 26702 y el Código Civil (Art. 1242), el interés moratorio constituye indemnización patrimonial independiente acumulada tras el vencimiento del plazo.
                </p>
              </div>
            )}

            {/* Resumen Total Exigible */}
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400 block">Total Capital:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {formatCurrency(selectedLiquidation.totalCapital)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Int. Compensatorio:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    {formatCurrency(selectedLiquidation.interesCompensatorioTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Int. Moratorio:</span>
                  <span className="font-mono font-bold text-rose-400 text-sm">
                    {formatCurrency(selectedLiquidation.interesMoratorioTotal)}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-400 block font-semibold uppercase tracking-wider text-[10px]">
                    TOTAL EXIGIBLE:
                  </span>
                  <span className="font-mono font-extrabold text-white text-lg">
                    {formatCurrency(selectedLiquidation.montoTotalExigible)}
                  </span>
                </div>
              </div>

              {/* Legal Payment Prelacion Order Reminder */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>
                  <strong>Orden de Imputación de Pagos:</strong> 1.º Interés Moratorio → 2.º Interés Compensatorio → 3.º Capital Principal.
                </span>
                <span className="text-amber-400 font-medium">Pago Íntegro Requerido</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => handleOpenMathAudit(selectedLiquidation)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Auditar Fórmulas y Decimales</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLiquidation(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cerrar
                </button>
                {selectedLiquidation.estado !== 'Pagado' && onNavigateToPayment && (
                  <button
                    onClick={() => {
                      const id = selectedLiquidation.id;
                      setSelectedLiquidation(null);
                      onNavigateToPayment(id);
                    }}
                    className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Proceder al Cobro</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
