import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  DollarSign,
  TrendingUp,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';

export const FinancialReports: React.FC = () => {
  const { clients, purchases, liquidations, installmentLoans, payments, currentBazar } = useApp();

  const [dateRange, setDateRange] = useState<'mes_actual' | 'trimestre' | 'anual'>('mes_actual');
  const [selectedClientId, setSelectedClientId] = useState<string>('todos');

  const bazarClients = clients.filter((c) => c.bazarId === currentBazar.id);
  const bazarPurchases = purchases.filter((p) => p.bazarId === currentBazar.id);
  const bazarLiquidations = liquidations.filter((l) => l.bazarId === currentBazar.id);
  const bazarLoans = installmentLoans.filter((l) => l.bazarId === currentBazar.id);
  const bazarPayments = payments.filter((p) => p.bazarId === currentBazar.id);

  // Aggregated indicators
  const totalVentasCredito = bazarPurchases.reduce((acc, p) => acc + p.montoTotal, 0);
  const totalCapitalColocado = bazarClients.reduce((acc, c) => acc + c.creditoUtilizado, 0);
  const totalInteresCompensatorio = bazarLiquidations.reduce(
    (acc, l) => acc + l.interesCompensatorioTotal,
    0
  );
  const totalMoraDevengada = bazarLiquidations.reduce(
    (acc, l) => acc + l.interesMoratorioTotal,
    0
  );
  const totalPagosRecaudados = bazarPayments.reduce((acc, p) => acc + p.montoPagado, 0);

  // Top clients by credit usage
  const topUsers = [...bazarClients]
    .sort((a, b) => b.creditoUtilizado - a.creditoUtilizado)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Reportes e Indicadores Financieros
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Consolidado de colocaciones, ingresos por intereses compensatorios y recaudación de mora
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="text-xs font-medium text-slate-800 bg-white border border-slate-300 rounded-lg py-1.5 px-3 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="mes_actual">Ciclo Comercial Actual</option>
            <option value="trimestre">Último Trimestre</option>
            <option value="anual">Año Comercial Vigente (360d)</option>
          </select>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Ventas a Crédito</span>
          <div className="text-lg font-bold font-mono text-slate-900">
            {formatCurrency(totalVentasCredito)}
          </div>
          <span className="text-[10px] text-slate-400">{bazarPurchases.length} operaciones</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Capital Vivo en Cartera</span>
          <div className="text-lg font-bold font-mono text-indigo-700">
            {formatCurrency(totalCapitalColocado)}
          </div>
          <span className="text-[10px] text-slate-400">Saldo insoluto actual</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Intereses Compensatorios</span>
          <div className="text-lg font-bold font-mono text-emerald-700">
            {formatCurrency(totalInteresCompensatorio)}
          </div>
          <span className="text-[10px] text-slate-400">Devengados</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Mora Devengada</span>
          <div className="text-lg font-bold font-mono text-rose-700">
            {formatCurrency(totalMoraDevengada)}
          </div>
          <span className="text-[10px] text-slate-400">Por retraso</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-medium">Recaudación Cobrada</span>
          <div className="text-lg font-bold font-mono text-slate-950">
            {formatCurrency(totalPagosRecaudados)}
          </div>
          <span className="text-[10px] text-slate-400">{bazarPayments.length} abonos</span>
        </div>
      </div>

      {/* Two Columns: Visual charts & Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Portafolio de Crédito & Estado */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Calidad de Cartera Crediticia
            </h3>
            <span className="text-[11px] text-slate-500">Evaluación de Riesgo SBS</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Al día bar */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cartera Normal (Al Día)
                </span>
                <span className="font-mono text-slate-800">
                  {formatCurrency(totalCapitalColocado - (bazarClients.reduce((acc, c) => acc + c.deudaVencida, 0)))}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-emerald-500 h-3 rounded-full"
                  style={{
                    width: `${Math.max(
                      10,
                      Math.round(
                        ((totalCapitalColocado - (bazarClients.reduce((acc, c) => acc + c.deudaVencida, 0))) /
                          (totalCapitalColocado || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* En mora bar */}
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span className="text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Cartera Vencida (En Mora)
                </span>
                <span className="font-mono text-rose-700 font-bold">
                  {formatCurrency(bazarClients.reduce((acc, c) => acc + c.deudaVencida, 0))}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-rose-500 h-3 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((bazarClients.reduce((acc, c) => acc + c.deudaVencida, 0)) /
                          (totalCapitalColocado || 1)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
              Los clientes en mora son restringidos por el motor de negocio de MiBazarPE para emitir nuevas transacciones, protegiendo la liquidez operativa del comerciante.
            </div>
          </div>
        </div>

        {/* Right: Clientes con Mayor Crédito Colocado */}
        <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Top Clientes por Utilización de Línea
            </h3>
            <span className="text-[11px] text-slate-500">Exposición de Capital</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {topUsers.map((c) => {
              const pct = Math.round(
                (c.creditoUtilizado / (c.financiero.lineaCreditoMax || 1)) * 100
              );

              return (
                <div key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 block truncate">{c.nombres}</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Línea: {formatCurrency(c.financiero.lineaCreditoMax)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-indigo-700 block">
                      {formatCurrency(c.creditoUtilizado)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{pct}% usado</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
