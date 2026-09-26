import React from 'react';
import {
  Store,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onNavigateHome: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigateHome, activeView, setActiveView }) => {
  const { currentUser, currentRole, switchRole, currentBazar, resetDemoData } = useApp();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    switchRole(e.target.value as UserRole);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title, single line text wordmark */}
        <button
          onClick={onNavigateHome}
          className="text-left flex items-center gap-2.5 focus:outline-none group"
        >
          <div className="w-9 h-9 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-indigo-800 transition-colors">
            M
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
              MiBazar<span className="text-indigo-600">PE</span>
            </span>
            <span className="text-[10px] font-medium text-slate-500 block -mt-0.5">
              Cuentas Corrientes
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {currentRole === 'owner' && (
            <>
              <button
                onClick={() => setActiveView('dashboard')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('clientes')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'clientes' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Clientes
              </button>
              <button
                onClick={() => setActiveView('nueva-venta')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'nueva-venta' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Nueva Venta
              </button>
              <button
                onClick={() => setActiveView('cuentas-corrientes')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'cuentas-corrientes' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Cuentas Corrientes
              </button>
              <button
                onClick={() => setActiveView('cuotas')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'cuotas' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Créditos en Cuotas
              </button>
            </>
          )}

          {currentRole === 'superadmin' && (
            <>
              <button
                onClick={() => setActiveView('admin-dashboard')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'admin-dashboard' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Dashboard Central
              </button>
              <button
                onClick={() => setActiveView('admin-bazares')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'admin-bazares' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Gestión de Bazares
              </button>
              <button
                onClick={() => setActiveView('admin-auditoria')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'admin-auditoria' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Auditoría Global
              </button>
            </>
          )}

          {currentRole === 'client' && (
            <>
              <button
                onClick={() => setActiveView('client-dashboard')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'client-dashboard' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Mi Crédito
              </button>
              <button
                onClick={() => setActiveView('client-compras')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'client-compras' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Mis Compras
              </button>
              <button
                onClick={() => setActiveView('client-cuotas')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'client-cuotas' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Mis Cuotas
              </button>
              <button
                onClick={() => setActiveView('client-pagos')}
                className={`transition-colors hover:text-slate-900 ${
                  activeView === 'client-pagos' ? 'text-indigo-600 font-semibold' : ''
                }`}
              >
                Mis Pagos
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions - Evaluator Role Switcher & Profile */}
        <div className="flex items-center gap-3">
          {/* Interactive Role Switcher for Academic Demonstration */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 pl-1.5 hidden sm:inline">
              Rol:
            </span>
            <select
              value={currentRole}
              onChange={handleRoleChange}
              className="text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer shadow-2xs"
            >
              <option value="owner">Dueño del Bazar</option>
              <option value="superadmin">Superadmin</option>
              <option value="client">Cliente</option>
            </select>
          </div>

          {/* Reset Demo button for quick evaluation re-testing */}
          <button
            onClick={resetDemoData}
            title="Reiniciar casos de prueba iniciales"
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-medium text-xs">
              {currentUser.nombre.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <span className="font-semibold text-slate-900 block truncate max-w-[140px]">
                {currentUser.nombre}
              </span>
              <span className="text-slate-500 block truncate max-w-[140px] text-[11px]">
                {currentRole === 'owner'
                  ? currentBazar.nombreComercial
                  : currentRole === 'superadmin'
                  ? 'Administración UPC'
                  : 'Cliente Comercial'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
