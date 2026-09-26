import React, { useState } from 'react';
import {
  Settings,
  Scale,
  ShieldCheck,
  Calendar,
  DollarSign,
  FileCheck,
  HelpCircle,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpButton } from '../common/ContextualHelp';

export const FinancialConfig: React.FC = () => {
  const { currentBazar, updateBazar, addToast } = useApp();

  const [nombreComercial, setNombreComercial] = useState(currentBazar.nombreComercial);
  const [lineaDefecto, setLineaDefecto] = useState(currentBazar.lineaPorDefecto);
  const [plazoMaxDefecto, setPlazoMaxDefecto] = useState(currentBazar.plazoMaxPorDefecto);
  const [diaCorteDefecto, setDiaCorteDefecto] = useState(currentBazar.diaCorteDefecto);
  const [diaPagoDefecto, setDiaPagoDefecto] = useState(currentBazar.diaPagoDefecto);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (diaPagoDefecto <= diaCorteDefecto) {
      addToast({
        tipo: 'error',
        titulo: 'Validación de Fechas',
        mensaje: 'El día de pago por defecto debe ser posterior al día de corte.',
      });
      return;
    }

    updateBazar(currentBazar.id, {
      nombreComercial,
      lineaPorDefecto: Number(lineaDefecto),
      plazoMaxPorDefecto: Number(plazoMaxDefecto),
      diaCorteDefecto: Number(diaCorteDefecto),
      diaPagoDefecto: Number(diaPagoDefecto),
    });

    addToast({
      tipo: 'success',
      titulo: 'Parámetros Actualizados',
      mensaje: 'Las políticas de crédito y corte del bazar fueron guardadas.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Configuración y Parámetros del Bazar
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Políticas generales de otorgamiento de crédito, fechas de ciclo y convenciones legales SBS
        </p>
      </div>

      {/* Convención financiera peruana (Bloque obligatorio de solo lectura) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5">
          <Scale className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Convención Financiera y Normativa Vigente (Solo Lectura)
          </h3>
          <HelpButton topicKey="base_comercial_360" className="text-slate-400 hover:text-white" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Base Temporal Anual:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
              360 Días
            </span>
            <span className="text-[10px] text-slate-500">Año comercial Ley N.º 26702 (Art. 9)</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Mes Comercial:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm mt-0.5 block">
              30 Días
            </span>
            <span className="text-[10px] text-slate-500">Uniformidad de cómputo</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Método de Amortización:</span>
            <span className="font-semibold text-white block mt-0.5">
              Francés Vencido Simple
            </span>
            <span className="text-[10px] text-slate-500">Cuotas uniformes ordinarias</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Precisión de Tasas:</span>
            <span className="font-mono font-bold text-indigo-400 text-sm mt-0.5 block">
              7+ Decimales
            </span>
            <span className="text-[10px] text-slate-500">Sin redondeo en factores</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Precisión Monetaria:</span>
            <span className="font-mono font-bold text-indigo-400 text-sm mt-0.5 block">
              2 Decimales
            </span>
            <span className="text-[10px] text-slate-500">Soles (PEN - S/) y Dólares</span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Orden de Prelación:</span>
            <span className="text-amber-400 font-semibold block mt-0.5 text-xs">
              1.º Mora · 2.º IC · 3.º Capital
            </span>
            <span className="text-[10px] text-slate-500">Imputación legal obligatoria</span>
          </div>
        </div>
      </div>

      {/* Editable Bazar Configuration */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5 text-xs">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Políticas Predeterminadas para Nuevos Clientes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nombre Comercial del Bazar</label>
            <input
              type="text"
              value={nombreComercial}
              onChange={(e) => setNombreComercial(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Línea de Crédito por Defecto (S/)
            </label>
            <input
              type="number"
              value={lineaDefecto}
              onChange={(e) => setLineaDefecto(Number(e.target.value))}
              min={50}
              max={10000}
              step={10}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Plazo Máximo en Cuotas por Defecto
            </label>
            <select
              value={plazoMaxDefecto}
              onChange={(e) => setPlazoMaxDefecto(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              {[2, 3, 4, 5, 6, 8, 10, 12].map((n) => (
                <option key={n} value={n}>
                  {n} Meses
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Día de Corte Predeterminado (1-28)
            </label>
            <input
              type="number"
              value={diaCorteDefecto}
              onChange={(e) => setDiaCorteDefecto(Number(e.target.value))}
              min={1}
              max={28}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Día de Pago Predeterminado (1-30)
            </label>
            <input
              type="number"
              value={diaPagoDefecto}
              onChange={(e) => setDiaPagoDefecto(Number(e.target.value))}
              min={1}
              max={30}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
            />
            <span className="text-[10px] text-slate-400">Debe ser &gt; día de corte en al menos 5 días</span>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Parámetros</span>
          </button>
        </div>
      </form>
    </div>
  );
};
