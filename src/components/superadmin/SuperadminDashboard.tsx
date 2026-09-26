import React from 'react';
import { Store, Users, ShieldAlert, CheckCircle2, TrendingUp, History, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SuperadminDashboardProps {
  onNavigateToBazares: () => void;
  onNavigateToAuditoria: () => void;
}

export const SuperadminDashboard: React.FC<SuperadminDashboardProps> = ({
  onNavigateToBazares,
  onNavigateToAuditoria,
}) => {
  const { bazares, auditLogs, clients, purchases } = useApp();

  const totalBazares = bazares.length;
  const bazaresActivos = bazares.filter((b) => b.estado === 'activo').length;
  const bazaresBaja = bazares.filter((b) => b.estado === 'baja').length;
  const totalClientes = clients.length;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Consola Central de Supervisión — Superadmin
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo global de establecimientos, usuarios y cumplimiento de auditoría (Ley N.º 26702)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToBazares}
            className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Store className="w-3.5 h-3.5" />
            <span>Gestionar Bazares</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total de Bazares</span>
            <Store className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalBazares}</div>
          <div className="text-[11px] text-slate-500">Establecimientos registrados</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Bazares Habilitados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">{bazaresActivos}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Operando al 100%</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Bazares en Baja</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-700">{bazaresBaja}</div>
          <div className="text-[11px] text-slate-500">Inhabilitados temporalmente</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Clientes Afiliados</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">{totalClientes}</div>
          <div className="text-[11px] text-slate-500">En todos los comercios</div>
        </div>
      </div>

      {/* Bazares Overview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Bazares Registrados en la Red
          </h3>
          <button
            onClick={onNavigateToBazares}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>Ver todos los bazares</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">RUC</th>
                <th className="px-4 py-3">Razón Social & Nombre Comercial</th>
                <th className="px-4 py-3">Dueño</th>
                <th className="px-4 py-3">Ubicación</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Línea Defecto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bazares.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-slate-800">{b.ruc}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900 block">{b.nombreComercial}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                      {b.razonSocial}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    <span className="block font-medium">{b.duenoNombre}</span>
                    <span className="text-[11px] text-slate-500 font-mono">DNI: {b.duenoDocumento}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {b.distrito}, {b.provincia}
                  </td>
                  <td className="px-4 py-3">
                    {b.estado === 'activo' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        De Baja
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-slate-900">
                    S/ {b.lineaPorDefecto.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Trazabilidad y Auditoría Reciente
            </h3>
          </div>
          <button
            onClick={onNavigateToAuditoria}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
          >
            <span>Ver bitácora completa</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{log.accion}</span>
                  <span className="text-[11px] text-slate-500">· {log.modulo}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 uppercase font-mono">
                    {log.rol}
                  </span>
                </div>
                <p className="text-slate-600">{log.registro}</p>
                {log.valorNuevo && (
                  <p className="text-[11px] text-slate-500 font-mono">{log.valorNuevo}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono text-slate-500 block text-[11px]">{log.fechaHora}</span>
                <span className="text-[10px] text-slate-400 block font-mono">IP: {log.ip || '127.0.0.1'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
