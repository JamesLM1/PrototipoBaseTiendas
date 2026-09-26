import React from 'react';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Clock,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/finance';

interface OwnerDashboardProps {
  onNavigate: (view: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onNavigate }) => {
  const { currentBazar, clients, purchases, liquidations, installmentLoans, payments } = useApp();

  const bazarClients = clients.filter((c) => c.bazarId === currentBazar.id);
  const totalCreditoOtorgado = bazarClients.reduce(
    (acc, c) => acc + c.financiero.lineaCreditoMax,
    0
  );
  const totalCreditoUtilizado = bazarClients.reduce(
    (acc, c) => acc + c.creditoUtilizado,
    0
  );
  const totalCreditoDisponible = bazarClients.reduce(
    (acc, c) => acc + c.saldoDisponible,
    0
  );
  const totalDeudaVencida = bazarClients.reduce(
    (acc, c) => acc + c.deudaVencida,
    0
  );
  const clientesEnMora = bazarClients.filter((c) => c.estado === 'observado_mora');

  // Today's purchases
  const hoyStr = new Date().toISOString().split('T')[0];
  const comprasDelMes = purchases.filter((p) => p.bazarId === currentBazar.id);
  const totalVentasMes = comprasDelMes.reduce((acc, p) => acc + p.montoTotal, 0);

  // Pending payments (liquidaciones pendientes o en mora)
  const liquidacionesPendientes = liquidations.filter(
    (l) => l.bazarId === currentBazar.id && l.estado !== 'Pagado'
  );

  return (
    <div className="space-y-6">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Dashboard Financiero — {currentBazar.nombreComercial}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión de cartera, límites de crédito, vencimientos y liquidaciones (Ley N.º 26702)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('nueva-venta')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Nueva Venta al Crédito</span>
          </button>
          <button
            onClick={() => onNavigate('pagos')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4 text-indigo-600" />
            <span>Registrar Pago</span>
          </button>
        </div>
      </div>

      {/* Critical Alert Banner if Mora exists */}
      {clientesEnMora.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                Atención: {clientesEnMora.length} cliente(s) presentan obligaciones vencidas en mora
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                {clientesEnMora.map((c) => c.nombres).join(', ')} tienen deudas vencidas por S/{' '}
                {totalDeudaVencida.toFixed(2)}. Nuevas compras bloqueadas hasta regularización.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('cuentas-corrientes')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-900 bg-white border border-rose-300 rounded-lg hover:bg-rose-100/50 whitespace-nowrap transition-colors"
          >
            Ver Cuentas en Mora
          </button>
        </div>
      )}

      {/* Main Metric Cards Grid (Fila 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Clientes con Crédito</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{bazarClients.length}</div>
          <div className="text-[11px] text-slate-500">
            {clientesEnMora.length > 0 ? (
              <span className="text-rose-600 font-medium">{clientesEnMora.length} en mora</span>
            ) : (
              <span className="text-emerald-600 font-medium">100% al día</span>
            )}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Línea Total Autorizada</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalCreditoOtorgado)}
          </div>
          <div className="text-[11px] text-slate-500">Tope máximo de cartera</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Saldo Deudor Colocado</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-700">
            {formatCurrency(totalCreditoUtilizado)}
          </div>
          <div className="text-[11px] text-slate-500">
            {((totalCreditoUtilizado / (totalCreditoOtorgado || 1)) * 100).toFixed(1)}% de utilización
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Deuda Vencida en Mora</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">
            {formatCurrency(totalDeudaVencida)}
          </div>
          <div className="text-[11px] text-slate-500">Generando tasa moratoria</div>
        </div>
      </div>

      {/* Metric Cards Grid (Fila 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Crédito Disponible Global</span>
          <div className="text-xl font-bold font-mono text-emerald-700">
            {formatCurrency(totalCreditoDisponible)}
          </div>
          <span className="text-[11px] text-slate-400">Capacidad remanente de compras</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Ventas al Crédito del Mes</span>
          <div className="text-xl font-bold font-mono text-slate-900">
            {formatCurrency(totalVentasMes)}
          </div>
          <span className="text-[11px] text-slate-400">{comprasDelMes.length} transacciones registradas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Liquidaciones por Cobrar</span>
          <div className="text-xl font-bold font-mono text-indigo-700">
            {liquidacionesPendientes.length}
          </div>
          <span className="text-[11px] text-slate-400">Fin de mes y cuotas vigentes</span>
        </div>
      </div>

      {/* Two Column Layout: Próximos Pagos vs Operaciones Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Próximos Pagos & Vencimientos */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Próximos Vencimientos y Liquidaciones
              </h3>
            </div>
            <button
              onClick={() => onNavigate('cuentas-corrientes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Período</th>
                  <th className="px-4 py-2.5">Fecha Límite</th>
                  <th className="px-4 py-2.5 text-right">Total Exigible</th>
                  <th className="px-4 py-2.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liquidacionesPendientes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No hay obligaciones pendientes de cobro.
                    </td>
                  </tr>
                ) : (
                  liquidacionesPendientes.map((liq) => {
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
                        <td className="px-4 py-3 text-slate-600">{liq.periodo}</td>
                        <td className="px-4 py-3 font-mono text-slate-700">
                          {liq.fechaLimitePago}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(liq.montoTotalExigible)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {liq.estado === 'En_Mora' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                              En Mora ({liq.diasMoraTranscurridos}d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Operaciones Recientes */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Últimas Compras al Crédito
              </h3>
            </div>
            <button
              onClick={() => onNavigate('clientes')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <span>Ver clientes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {comprasDelMes.slice(0, 5).map((p) => {
              const client = clients.find((c) => c.id === p.clienteId);
              return (
                <div key={p.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-900 block truncate max-w-[170px]">
                      {client?.nombres || 'Cliente'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span>{p.fechaCompra}</span>
                      <span>·</span>
                      <span className="font-medium text-indigo-600">
                        {p.modalidad === 'FIN_DE_MES' ? 'Fin de Mes' : `${p.numeroCuotas} Cuotas`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 block">
                      {formatCurrency(p.montoTotal)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {p.items.length} {p.items.length === 1 ? 'artículo' : 'artículos'}
                    </span>
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
