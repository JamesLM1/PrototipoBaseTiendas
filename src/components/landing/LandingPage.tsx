import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Receipt,
  CalendarDays,
  FileCheck2,
  ArrowRight,
  Store,
  Users,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onGoToRegister }) => {
  const { switchRole } = useApp();

  const handleQuickDemo = (role: UserRole, clientId?: string) => {
    switchRole(role, clientId);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 text-center border-b border-slate-800">
        <span className="font-semibold text-white">UPC · Finanzas e Ingeniería Económica</span>{' '}
        <span className="text-slate-500">·</span> Cumplimiento normativo Ley N.º 26702 (Art. 9) y Res. SBS N.º 8181-2012
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SaaS de Crédito Comercial para Bazares Peruanos</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight">
                Control de Cuentas Corrientes y Créditos Directos
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Digitalice los cuadernos de fiado tradicionales con rigor financiero. Gestione líneas de crédito, fechas de corte, cancelaciones a fin de mes y cuotas mediante el método francés con capitalización de gracia inicial.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={onGoToLogin}
                  className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md transition-all flex items-center gap-2 group"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={onGoToRegister}
                  className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Registrar mi Bazar
                </button>
              </div>

              {/* Fast Evaluator demo switcher */}
              <div className="pt-6 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Acceso Rápido para Evaluación Académica:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickDemo('owner')}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    👤 Dueño del Bazar (Carlos M.)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('client', 'client-1')}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    🟢 Cliente al Día (Juan P.)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('client', 'client-2')}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    🔴 Cliente en Mora (María M.)
                  </button>
                  <button
                    onClick={() => handleQuickDemo('superadmin')}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 border border-slate-200 rounded-lg text-slate-800 transition-colors"
                  >
                    ⚡ Superadmin (Docente)
                  </button>
                </div>
              </div>
            </div>

            {/* Visual preview card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-2xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base">
                      MB
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Bazar & Papelería Santa Anita
                      </h4>
                      <p className="text-xs text-slate-400">RUC 20608945123 · Activo</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                    Base 360/30
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Crédito Otorgado</span>
                    <span className="text-base font-bold font-mono text-white mt-1 block">
                      S/ 3,100.00
                    </span>
                  </div>
                  <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="text-slate-400 block text-[11px]">Saldo Pendiente</span>
                    <span className="text-base font-bold font-mono text-indigo-400 mt-1 block">
                      S/ 820.00
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Método de Amortización:</span>
                    <span className="font-semibold text-white">Francés Vencido</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Precisión de Tasas:</span>
                    <span className="font-mono text-indigo-400">7+ decimales</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Regla de Imputación:</span>
                    <span className="text-amber-300">1.º Mora · 2.º IC · 3.º Capital</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>Pagos Parciales en Fin de Mes:</span>
                    <span className="text-rose-400 font-semibold">Prohibidos (Total)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs pt-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Consentimiento Ley N.º 29733 de Datos Personales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Diseñado para el Rigor Matemático y la Operativa Real
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Arquitectura que combina ingeniería de software con matemática financiera estricta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                1. Liquidación a Fin de Mes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Consolida compras realizadas antes de la hora de corte. Calcula el interés compensatorio exacto por los días transcurridos hasta la fecha límite. Si existe atraso, computa intereses moratorios independientes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                2. Cuotas con Gracia Total (Francés)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Capitaliza la deuda por los días de gracia transcurridos entre la fecha de adquisición y el primer corte del ciclo. Estructura el cronograma de cuotas uniformes vencidas con desglose de interés y amortización.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                3. Prelación y Control de Mora
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Aplica la prelación obligatoria al registrar pagos (Mora → Interés compensatorio → Capital). Bloquea automáticamente nuevas compras para clientes con obligaciones vencidas impagas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 MiBazarPE. Proyecto Académico UPC - Finanzas e Ingeniería Económica.
          </div>
          <div className="flex items-center gap-6">
            <span>Ley N.º 26702</span>
            <span>·</span>
            <span>Res. SBS N.º 8181-2012</span>
            <span>·</span>
            <span>Ley N.º 29733</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
