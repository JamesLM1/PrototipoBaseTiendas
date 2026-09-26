import React, { useState } from 'react';
import { UserCheck, Search, Shield, Store, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const UserManagement: React.FC = () => {
  const { clients, bazares } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Combine users
  const allUsers = [
    {
      id: 'usr-admin',
      nombre: 'Nataly Bravo López (Docente/Admin)',
      email: 'admin@mibazar.pe',
      rol: 'Superadministrador',
      bazar: 'Plataforma Central UPC',
      estado: 'Activo',
    },
    ...bazares.map((b) => ({
      id: 'usr-bazar-' + b.id,
      nombre: b.duenoNombre,
      email: b.correo,
      rol: 'Dueño del Bazar',
      bazar: b.nombreComercial,
      estado: b.estado === 'activo' ? 'Activo' : 'De Baja',
    })),
    ...clients.map((c) => ({
      id: 'usr-client-' + c.id,
      nombre: c.nombres,
      email: c.email,
      rol: 'Cliente Comercial',
      bazar: bazares.find((b) => b.id === c.bazarId)?.nombreComercial || 'Bazar',
      estado: c.estado === 'observado_mora' ? 'En Mora' : 'Activo',
    })),
  ];

  const filteredUsers = allUsers.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.bazar.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Directorio Global de Usuarios
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cuentas registradas, asignación de roles y permisos del sistema
          </p>
        </div>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, correo, rol o bazar..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Correo Electrónico</th>
                <th className="px-4 py-3">Rol de Acceso</th>
                <th className="px-4 py-3">Establecimiento / Alcance</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900">{u.nombre}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700">
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{u.bazar}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        u.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {u.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
