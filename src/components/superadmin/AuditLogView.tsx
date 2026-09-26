import React, { useState } from 'react';
import { History, Search, Filter, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('todos');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const modules = ['todos', 'Ventas al Crédito', 'Cobranzas y Pagos', 'Gestión de Clientes', 'Gestión de Bazares'];

  const filteredLogs = auditLogs.filter((l) => {
    const matchesSearch =
      l.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.registro.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule =
      selectedModule === 'todos' ? true : l.modulo === selectedModule;

    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Bitácora de Auditoría y Trazabilidad
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro cronológico inalterable de operaciones financieras y administrativas
          </p>
        </div>
      </div>

      {/* Filter controls */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, acción o registro..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Módulo:</span>
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedModule(m)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedModule === m
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Usuario & Rol</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Módulo</th>
                <th className="px-4 py-3">Registro / Objeto</th>
                <th className="px-4 py-3">Resultado</th>
                <th className="px-4 py-3 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No existen registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {log.fechaHora}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">{log.usuario}</span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">{log.rol}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{log.modulo}</td>
                    <td className="px-4 py-3 text-slate-700 max-w-xs truncate">{log.registro}</td>
                    <td className="px-4 py-3">
                      {log.resultado === 'Exitoso' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Exitoso</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          <span>Fallido</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Detalle del Registro de Auditoría
              </h3>
              <span className="font-mono text-[11px] text-slate-400">ID: {selectedLog.id}</span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">Fecha y Hora</span>
                  <span className="font-mono font-medium text-slate-900">{selectedLog.fechaHora}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Dirección IP</span>
                  <span className="font-mono text-slate-700">{selectedLog.ip || '190.237.45.12'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Operador Responsable</span>
                <span className="font-semibold text-slate-900">
                  {selectedLog.usuario} ({selectedLog.rol})
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-slate-400 block text-[11px]">Acción Ejecutada</span>
                <span className="font-mono font-bold text-indigo-700">{selectedLog.accion}</span>
                <p className="text-slate-700 text-xs mt-1">{selectedLog.registro}</p>
              </div>

              {selectedLog.valorAnterior && (
                <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Estado Anterior:</span>
                  <span className="font-mono text-slate-700">{selectedLog.valorAnterior}</span>
                </div>
              )}

              {selectedLog.valorNuevo && (
                <div className="p-2.5 bg-indigo-50/50 rounded border border-indigo-100">
                  <span className="text-[10px] text-indigo-600 font-semibold uppercase block">Estado Nuevo / Impacto:</span>
                  <span className="font-mono text-indigo-950">{selectedLog.valorNuevo}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
