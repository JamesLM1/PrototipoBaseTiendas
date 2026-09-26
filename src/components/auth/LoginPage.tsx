import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Shield, HelpCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { HelpButton } from '../common/ContextualHelp';

interface LoginPageProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onGoToRegister,
  onBackToLanding,
}) => {
  const { switchRole, addToast } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('owner');
  const [email, setEmail] = useState('carlos@bazarsantaanita.pe');
  const [password, setPassword] = useState('MiBazar2026*');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'owner') {
      setEmail('carlos@bazarsantaanita.pe');
    } else if (role === 'superadmin') {
      setEmail('admin@mibazar.pe');
    } else if (role === 'client') {
      setEmail('juan.perez@gmail.com');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor ingrese tanto el correo como la contraseña.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('Ingrese un formato de correo electrónico válido.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    // Role check and switch
    if (selectedRole === 'client') {
      if (email.includes('maria')) {
        switchRole('client', 'client-2');
      } else {
        switchRole('client', 'client-1');
      }
    } else {
      switchRole(selectedRole);
    }

    addToast({
      tipo: 'success',
      titulo: 'Inicio de Sesión Exitoso',
      mensaje: `Bienvenido a MiBazarPE como ${
        selectedRole === 'owner'
          ? 'Dueño del Bazar'
          : selectedRole === 'superadmin'
          ? 'Superadministrador'
          : 'Cliente Comercial'
      }.`,
    });
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-900 text-white font-bold text-2xl shadow-sm mb-3">
            M
          </div>
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            Acceso a MiBazarPE
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Sistema de Control de Cuentas Corrientes Comerciales
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 sm:rounded-2xl space-y-6">
          {/* Role selector tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Seleccione el Perfil de Usuario
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleRoleSelect('owner')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  selectedRole === 'owner'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dueño Bazar
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('client')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  selectedRole === 'client'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cliente
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('superadmin')}
                className={`py-2 text-xs font-medium rounded-lg transition-all ${
                  selectedRole === 'superadmin'
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Superadmin
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center">
                  <span>Correo Electrónico</span>
                  <HelpButton topicKey="ley_29733" />
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@bazar.pe"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center">
                  <span>Contraseña</span>
                  <HelpButton topicKey="ley_29733" />
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Debe incluir mayúscula, minúscula, número y símbolo.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
            >
              Acceder al Sistema
            </button>
          </form>

          {/* Quick test credentials buttons for academic evaluation */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              Credenciales Rápidas para Evaluación:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('owner');
                  setEmail('carlos@bazarsantaanita.pe');
                  setPassword('MiBazar2026*');
                }}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 text-left text-slate-700"
              >
                <span className="font-semibold block text-slate-900">Carlos Mendoza</span>
                <span className="text-[10px] text-slate-500">Dueño de Bazar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('client');
                  setEmail('maria.mendoza@gmail.com');
                  setPassword('MiBazar2026*');
                }}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 text-left text-slate-700"
              >
                <span className="font-semibold block text-rose-700">María Mendoza</span>
                <span className="text-[10px] text-slate-500">Cliente en Mora</span>
              </button>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-600">¿Desea registrar su establecimiento? </span>
            <button
              type="button"
              onClick={onGoToRegister}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Registrar mi Bazar
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-5 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900">Recuperación de Acceso</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Por medidas de seguridad de MiBazarPE, se ha enviado una clave temporal al correo comercial registrado.
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
