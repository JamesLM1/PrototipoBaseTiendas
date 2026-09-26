import React from 'react';
import { X, Calculator, ArrowRight, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CalculationDetailDrawer: React.FC = () => {
  const { activeCalculationDetail, closeCalculationDetail } = useApp();

  if (!activeCalculationDetail) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-white">
                  Auditoría y Detalle Financiero
                </h3>
                <p className="text-xs text-slate-400">
                  {activeCalculationDetail.titulo} · {activeCalculationDetail.clienteNombre}
                </p>
              </div>
            </div>
            <button
              onClick={closeCalculationDetail}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-800">
            {/* Regulatory banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                Cálculos normados bajo la <strong>Ley N.º 26702, Art. 9</strong> (año de 360 días, mes de 30 días) y <strong>Res. SBS N.º 8181-2012</strong>. Mínimo 7 decimales en tasas.
              </span>
            </div>

            {/* Inputs grid */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 tracking-wider mb-2.5">
                PARÁMETROS INICIALES REGISTRADOS
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(activeCalculationDetail.datosEntrada).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[11px] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="font-mono font-medium text-slate-900 mt-0.5 block truncate">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 tracking-wider mb-3">
                PASOS MATEMÁTICOS DE RESOLUCIÓN
              </h4>
              <div className="space-y-4">
                {activeCalculationDetail.pasos.map((paso, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-xs font-semibold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-slate-900">
                        {paso.paso}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {paso.descripcion}
                    </p>

                    {paso.formula && (
                      <div className="p-2 bg-slate-50 rounded border border-slate-150 font-mono text-xs text-slate-700">
                        <span className="text-[10px] text-slate-400 block mb-0.5">Fórmula Teórica:</span>
                        {paso.formula}
                      </div>
                    )}

                    {paso.sustitucion && (
                      <div className="p-2 bg-indigo-50/40 rounded border border-indigo-100 font-mono text-xs text-indigo-950">
                        <span className="text-[10px] text-indigo-500 block mb-0.5">Sustitución Numérica:</span>
                        {paso.sustitucion}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs font-medium">
                      <span className="text-slate-500">Valor obtenido:</span>
                      <span className="font-mono font-semibold text-indigo-700">
                        {paso.resultado}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Final Summary Card */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 tracking-wider mb-2.5">
                RESULTADO FINAL CONSOLIDADO
              </h4>
              <div className="bg-slate-900 text-white rounded-xl p-4.5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Liquidación Validada por Motor MiBazarPE</span>
                </div>
                <div className="divide-y divide-slate-800">
                  {Object.entries(activeCalculationDetail.resumenFinal).map(([lbl, val]) => (
                    <div key={lbl} className="flex justify-between py-2 text-xs">
                      <span className="text-slate-400 capitalize">
                        {lbl.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                      <span className="font-mono font-semibold text-white">
                        {String(val)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={closeCalculationDetail}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cerrar Detalle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
