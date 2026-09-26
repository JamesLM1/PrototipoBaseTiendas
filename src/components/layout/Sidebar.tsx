import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  CalendarDays,
  CreditCard,
  BarChart3,
  Settings,
  History,
  Store,
  ShieldCheck,
  UserCheck,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const { currentRole, currentBazar, currentClient, openHelp } = useApp();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] border-r border-slate-800">
      {/* Bazar / Context info card */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/50">
        <div className="text-[11px] font-semibold text-slate-400 tracking-wider">
          {currentRole === 'owner'
            ? 'BAZAR ACTIVO'
            : currentRole === 'superadmin'
            ? 'PLATAFORMA CENTRAL'
            : 'PORTAL CLIENTE'}
        </div>
        <div className="text-sm font-bold text-white mt-1 truncate">
          {currentRole === 'owner'
            ? currentBazar.nombreComercial
            : currentRole === 'superadmin'
            ? 'Consola de Supervisión'
            : currentClient.nombres}
        </div>
        <div className="text-xs text-slate-400 truncate mt-0.5">
          {currentRole === 'owner'
            ? `RUC: ${currentBazar.ruc}`
            : currentRole === 'superadmin'
            ? 'Ley N.º 26702 & SBS'
            : `DNI: ${currentClient.numeroDocumento}`}
        </div>
      </div>

      {/* Nav items list */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {currentRole === 'owner' && (
          <>
            <button
              onClick={() => setActiveView('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard General</span>
            </button>

            <button
              onClick={() => setActiveView('clientes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'clientes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Clientes & Líneas</span>
            </button>

            <button
              onClick={() => setActiveView('productos')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'productos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Catálogo de Productos</span>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-400 tracking-wider">
              OPERACIONES DE CRÉDITO
            </div>

            <button
              onClick={() => setActiveView('nueva-venta')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'nueva-venta'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>Nueva Venta al Crédito</span>
            </button>

            <button
              onClick={() => setActiveView('cuentas-corrientes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'cuentas-corrientes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Cuentas Corrientes (Fin de Mes)</span>
            </button>

            <button
              onClick={() => setActiveView('cuotas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'cuotas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Créditos en Cuotas (Francés)</span>
            </button>

            <button
              onClick={() => setActiveView('pagos')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'pagos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-400" />
              <span>Cobranzas & Pagos</span>
            </button>

            <div className="pt-3 pb-1 px-3 text-[10px] font-semibold text-slate-400 tracking-wider">
              CONTROL Y CONFIGURACIÓN
            </div>

            <button
              onClick={() => setActiveView('reportes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'reportes'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reportes Financieros</span>
            </button>

            <button
              onClick={() => setActiveView('configuracion')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'configuracion'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Parámetros del Bazar</span>
            </button>

            <button
              onClick={() => setActiveView('auditoria')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'auditoria'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Auditoría de Operaciones</span>
            </button>
          </>
        )}

        {currentRole === 'superadmin' && (
          <>
            <button
              onClick={() => setActiveView('admin-dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'admin-dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Plataforma</span>
            </button>

            <button
              onClick={() => setActiveView('admin-bazares')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'admin-bazares'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Gestión de Bazares</span>
            </button>

            <button
              onClick={() => setActiveView('admin-usuarios')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'admin-usuarios'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Directorio de Usuarios</span>
            </button>

            <button
              onClick={() => setActiveView('admin-auditoria')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'admin-auditoria'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoría y Trazabilidad</span>
            </button>
          </>
        )}

        {currentRole === 'client' && (
          <>
            <button
              onClick={() => setActiveView('client-dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'client-dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen de Mi Crédito</span>
            </button>

            <button
              onClick={() => setActiveView('client-compras')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'client-compras'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Mis Compras al Crédito</span>
            </button>

            <button
              onClick={() => setActiveView('client-cuotas')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'client-cuotas'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Mis Cuotas & Cronogramas</span>
            </button>

            <button
              onClick={() => setActiveView('client-pagos')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeView === 'client-pagos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Mis Pagos Realizados</span>
            </button>
          </>
        )}
      </div>

      {/* Footer info box with legal reference */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/30 text-[11px] text-slate-400 space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span>Normativa Financiera</span>
          <button
            onClick={() => openHelp('base_comercial_360')}
            className="text-indigo-400 hover:text-indigo-300"
            title="Ver marco legal"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 leading-normal">
          Año comercial 360d · Mes 30d · Francés ordinario vencido. Res. SBS N.º 8181-2012.
        </p>
      </div>
    </aside>
  );
};
