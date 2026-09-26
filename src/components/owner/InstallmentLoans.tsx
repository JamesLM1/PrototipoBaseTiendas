import React, { useState } from 'react';
import {
  CalendarDays,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileSpreadsheet,
  CreditCard,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InstallmentLoan } from '../../types';
import { formatCurrency, formatRatePercent } from '../../utils/finance';

interface InstallmentLoansProps {
  onNavigateToPayment?: (loanId: string, cuotaNum: number) => void;
  filterClientId?: string;
}

export const InstallmentLoans: React.FC<InstallmentLoansProps> = ({
  onNavigateToPayment,
  filterClientId,
}) => {
  const { installmentLoans, clients, currentBazar, openCalculationDetail } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLoan, setSelectedLoan] = useState<InstallmentLoan | null>(null);

  const bazarLoans = installmentLoans.filter(
    (loan) =>
      loan.bazarId === currentBazar.id &&
      (!filterClientId || loan.clienteId === filterClientId)
  );

  const filteredLoans = bazarLoans.filter((l) => {
    const client = clients.find((c) => c.id === l.clienteId);
    return (
      client?.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client?.numeroDocumento.includes(searchTerm) ||
      l.id.includes(searchTerm)
    );
  });

  const handleOpenMathAudit = (loan: InstallmentLoan) => {
    const client = clients.find((c) => c.id === loan.clienteId);
    if (!client) return;

    openCalculationDetail({
      titulo: 'Auditoría Método Francés con Gracia Total Inicial',
      modalidad: 'CUOTAS',
      clienteNombre: client.nombres,
      datosEntrada: {
        montoOriginalCompra: formatCurrency(loan.montoOriginal),
        diasGraciaTranscurridos: `${loan.diasGraciaTotal} días calendario`,
        temPeriodicaMensual: formatRatePercent(loan.temCompensatoria, 7),
        numeroMesesFinanciados: `${loan.numeroCuotas} cuotas`,
      },
      pasos: [
        {
          paso: '1. Factor de Capitalización de Intereses en Gracia',
          descripcion: 'Capitalización por los días transcurridos entre la fecha de adquisición y el primer corte mensual.',
          formula: 'Factor_gracia = (1 + TED)^días_gracia',
          resultado: loan.factorCapitalizacionGracia.toFixed(8),
        },
        {
          paso: "2. Determinación del Saldo Capitalizado Inicial (P')",
          descripcion: 'Nuevo saldo insoluto vivo sobre el que se amortizan las n cuotas periódicas francesas.',
          formula: "P' = Capital × Factor_gracia",
          resultado: formatCurrency(loan.capitalVivoInicial),
        },
        {
          paso: '3. Interés Acumulado por Período de Gracia',
          descripcion: "Interés incorporado a la base de cálculo deudor (P' - Capital original).",
          formula: "I_g = P' - Capital",
          resultado: formatCurrency(loan.interesGraciaAcumulado),
        },
        {
          paso: '4. Cuota Constante Vencida (Método Francés Ordinario)',
          descripcion: 'Cuota uniforme calculada con la TEM y base comercial de 30 días.',
          formula: "C = P' × [TEM × (1 + TEM)^n] / [(1 + TEM)^n - 1]",
          resultado: formatCurrency(loan.montoCuotaFija),
        },
      ],
      resumenFinal: {
        principalOriginal: formatCurrency(loan.montoOriginal),
        capitalVivoCapitalizado: formatCurrency(loan.capitalVivoInicial),
        cuotaMensualFija: formatCurrency(loan.montoCuotaFija),
        interesesProyectados: formatCurrency(loan.totalInteresesProyectados),
        saldoRemanente: formatCurrency(loan.saldoPendienteActual),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Créditos Comerciales en Cuotas Mensuales
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Amortización mediante el Método Francés Vencido Simple Ordinario con base comercial 360/30 (Ley N.º 26702)
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
            placeholder="Buscar por cliente o código de crédito..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {filteredLoans.length} créditos vigentes
        </span>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Cliente Titular</th>
                <th className="px-4 py-3">Fecha Inicio</th>
                <th className="px-4 py-3 text-right">Capital Original</th>
                <th className="px-4 py-3 text-right">Capital Vivo (P')</th>
                <th className="px-4 py-3 text-center">Plazo / Progreso</th>
                <th className="px-4 py-3 text-right">Cuota Fija</th>
                <th className="px-4 py-3 text-right">Saldo Insoluto</th>
                <th className="px-4 py-3">Próximo Vencimiento</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    No existen financiamientos en cuotas activos en este bazar.
                  </td>
                </tr>
              ) : (
                filteredLoans.map((loan) => {
                  const client = clients.find((c) => c.id === loan.clienteId);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">
                          {client?.nombres || 'Cliente'}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {client?.tipoDocumento}: {client?.numeroDocumento}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{loan.fechaInicio}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">
                        {formatCurrency(loan.montoOriginal)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-indigo-700">
                        {formatCurrency(loan.capitalVivoInicial)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-slate-900 block">
                          {loan.cuotasPagadas} / {loan.numeroCuotas}
                        </span>
                        <span className="text-[10px] text-slate-400">cuotas pagadas</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(loan.montoCuotaFija)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(loan.saldoPendienteActual)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-800 block">
                          {loan.proximaCuotaVencimiento}
                        </span>
                        {loan.saldoPendienteActual === 0 ? (
                          <span className="text-[10px] font-semibold text-emerald-600">Cancelado</span>
                        ) : (
                          <span className="text-[10px] text-indigo-600">
                            Cuota: {formatCurrency(loan.proximaCuotaMonto)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Cronograma</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL P71: Detalle del Crédito y Cronograma Francés */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cronograma de Amortización — Método Francés Vencido
                </h3>
                <p className="text-slate-500 font-mono text-[11px]">
                  Crédito #{selectedLoan.id} · Titular:{' '}
                  {clients.find((c) => c.id === selectedLoan.clienteId)?.nombres}
                </p>
              </div>
              <button
                onClick={() => handleOpenMathAudit(selectedLoan)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors self-start"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Auditar Fórmulas y Decimales</span>
              </button>
            </div>

            {/* Financial Parameters Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Capital Original</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatCurrency(selectedLoan.montoOriginal)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {selectedLoan.diasGraciaTotal}d gracia inicial
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Capital Capitalizado (P')</span>
                <span className="font-mono font-bold text-indigo-700 text-sm mt-0.5 block">
                  {formatCurrency(selectedLoan.capitalVivoInicial)}
                </span>
                <span className="text-[10px] text-indigo-500 block font-mono">
                  (+{formatCurrency(selectedLoan.interesGraciaAcumulado)} interés gracia)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Tasa Mensual (TEM)</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatRatePercent(selectedLoan.temCompensatoria, 7)}
                </span>
                <span className="text-[10px] text-slate-400 block">Base mes 30d</span>
              </div>
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <span className="text-[10px] text-indigo-600 font-semibold block">Cuota Mensual Fija (C)</span>
                <span className="font-mono font-bold text-indigo-950 text-base mt-0.5 block">
                  {formatCurrency(selectedLoan.montoCuotaFija)}
                </span>
                <span className="text-[10px] text-slate-500 block font-mono">
                  Saldo: {formatCurrency(selectedLoan.saldoPendienteActual)}
                </span>
              </div>
            </div>

            {/* Amortization Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Tabla de Servicio de Deuda Proyectada</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {selectedLoan.numeroCuotas} Períodos Mensuales
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="px-3 py-2 text-center">N.º</th>
                      <th className="px-3 py-2">Fecha Vencimiento</th>
                      <th className="px-3 py-2 text-right">Saldo Inicial (CI_k-1)</th>
                      <th className="px-3 py-2 text-right">Interés (I_k)</th>
                      <th className="px-3 py-2 text-right">Amortización (A_k)</th>
                      <th className="px-3 py-2 text-right">Cuota Fija (C)</th>
                      <th className="px-3 py-2 text-right">Saldo Final (CI_k)</th>
                      <th className="px-3 py-2 text-center">Estado</th>
                      <th className="px-3 py-2 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {selectedLoan.cronograma.map((row) => (
                      <tr key={row.numeroCuota} className="hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-center font-bold text-indigo-700">
                          {row.numeroCuota}
                        </td>
                        <td className="px-3 py-2 text-slate-700 font-sans">{row.fechaVencimiento}</td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {formatCurrency(row.saldoInicial)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-700">
                          {formatCurrency(row.interes)}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-700 font-medium">
                          {formatCurrency(row.amortizacion)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900">
                          {formatCurrency(row.cuota)}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {formatCurrency(row.saldoFinal)}
                        </td>
                        <td className="px-3 py-2 text-center font-sans">
                          {row.estado === 'Pagada' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✔ Pagada
                            </span>
                          )}
                          {row.estado === 'Proxima' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              ● Próxima
                            </span>
                          )}
                          {row.estado === 'Vencida' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              ⚠ Vencida
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right font-sans">
                          {row.estado !== 'Pagada' && onNavigateToPayment && (
                            <button
                              onClick={() => {
                                const lId = selectedLoan.id;
                                const cNum = row.numeroCuota;
                                setSelectedLoan(null);
                                onNavigateToPayment(lId, cNum);
                              }}
                              className="px-2 py-0.5 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                            >
                              Pagar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
              >
                Cerrar Cronograma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
