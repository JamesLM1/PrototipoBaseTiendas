import React, { useState } from 'react';
import { Store, Plus, Search, Filter, CheckCircle2, ShieldAlert, Edit2, Eye, Power } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Bazar } from '../../types';

export const BazarManagement: React.FC = () => {
  const { bazares, createBazar, updateBazar, toggleBazarStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'todos' | 'activo' | 'baja'>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBazar, setEditingBazar] = useState<Bazar | null>(null);
  const [viewingBazar, setViewingBazar] = useState<Bazar | null>(null);

  // Form State
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [duenoNombre, setDuenoNombre] = useState('');
  const [duenoDocumento, setDuenoDocumento] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('Lima');
  const [provincia, setProvincia] = useState('Lima');
  const [departamento, setDepartamento] = useState('Lima');
  const [lineaPorDefecto, setLineaPorDefecto] = useState(500);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingBazar(null);
    setRuc('');
    setRazonSocial('');
    setNombreComercial('');
    setDuenoNombre('');
    setDuenoDocumento('');
    setCorreo('');
    setTelefono('');
    setDireccion('');
    setDistrito('Santa Anita');
    setProvincia('Lima');
    setDepartamento('Lima');
    setLineaPorDefecto(500);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Bazar) => {
    setEditingBazar(b);
    setRuc(b.ruc);
    setRazonSocial(b.razonSocial);
    setNombreComercial(b.nombreComercial);
    setDuenoNombre(b.duenoNombre);
    setDuenoDocumento(b.duenoDocumento);
    setCorreo(b.correo);
    setTelefono(b.telefono);
    setDireccion(b.direccion);
    setDistrito(b.distrito);
    setProvincia(b.provincia);
    setDepartamento(b.departamento);
    setLineaPorDefecto(b.lineaPorDefecto);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruc || !razonSocial || !nombreComercial || !duenoNombre || !correo) {
      setFormError('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    if (ruc.length !== 11) {
      setFormError('El RUC debe tener exactamente 11 dígitos.');
      return;
    }

    if (editingBazar) {
      updateBazar(editingBazar.id, {
        ruc,
        razonSocial,
        nombreComercial,
        duenoNombre,
        duenoDocumento,
        correo,
        telefono,
        direccion,
        distrito,
        provincia,
        departamento,
        lineaPorDefecto: Number(lineaPorDefecto),
      });
    } else {
      createBazar({
        ruc,
        razonSocial,
        nombreComercial,
        duenoNombre,
        duenoDocumento,
        correo,
        telefono,
        direccion,
        distrito,
        provincia,
        departamento,
        estado: 'activo',
        lineaPorDefecto: Number(lineaPorDefecto),
        plazoMaxPorDefecto: 6,
        diaCorteDefecto: 20,
        diaPagoDefecto: 26,
      });
    }

    setIsModalOpen(false);
  };

  const filteredBazares = bazares.filter((b) => {
    const matchesSearch =
      b.ruc.includes(searchTerm) ||
      b.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.duenoNombre.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === 'todos' ? true : b.estado === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Gestión Central de Bazares
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Alta, supervisión y administración de comercios afiliados en MiBazarPE
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Bazar</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por RUC, nombre o dueño..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Estado:</span>
          {(['todos', 'activo', 'baja'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                filterStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bazares Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">RUC</th>
                <th className="px-4 py-3">Razón Social & Comercial</th>
                <th className="px-4 py-3">Propietario</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Alta</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBazares.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron bazares con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredBazares.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{b.ruc}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900 block">{b.nombreComercial}</span>
                      <span className="text-[11px] text-slate-500 block truncate max-w-xs">{b.razonSocial}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 block">{b.duenoNombre}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Doc: {b.duenoDocumento}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="block truncate max-w-[150px]">{b.correo}</span>
                      <span className="text-[11px] font-mono text-slate-500 block">{b.telefono}</span>
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
                    <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                      {b.fechaAlta}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingBazar(b)}
                          title="Ver detalle del establecimiento"
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(b)}
                          title="Editar información"
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleBazarStatus(b.id)}
                          title={b.estado === 'activo' ? 'Dar de baja bazar' : 'Reactivar bazar'}
                          className={`p-1 rounded ${
                            b.estado === 'activo'
                              ? 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              {editingBazar ? 'Modificar Información del Bazar' : 'Registrar Nuevo Establecimiento'}
            </h3>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">RUC (11 dígitos) *</label>
                  <input
                    type="text"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                    maxLength={11}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Razón Social *</label>
                  <input
                    type="text"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Propietario / Dueño *</label>
                  <input
                    type="text"
                    value={duenoNombre}
                    onChange={(e) => setDuenoNombre(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">DNI del Dueño *</label>
                  <input
                    type="text"
                    value={duenoDocumento}
                    onChange={(e) => setDuenoDocumento(e.target.value)}
                    required
                    maxLength={8}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Correo Comercial *</label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Dirección Física</label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Distrito</label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Línea Base por Defecto (S/)</label>
                  <input
                    type="number"
                    value={lineaPorDefecto}
                    onChange={(e) => setLineaPorDefecto(Number(e.target.value))}
                    min={50}
                    max={10000}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  {editingBazar ? 'Actualizar Bazar' : 'Crear Bazar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal View Detail */}
      {viewingBazar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Ficha Técnica del Establecimiento
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block text-[11px]">Razón Social</span>
                <span className="font-semibold text-slate-900">{viewingBazar.razonSocial}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">RUC</span>
                  <span className="font-mono text-slate-800">{viewingBazar.ruc}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Estado</span>
                  <span className="capitalize font-semibold text-indigo-700">{viewingBazar.estado}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Propietario</span>
                <span className="text-slate-800">{viewingBazar.duenoNombre} (DNI: {viewingBazar.duenoDocumento})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Dirección</span>
                <span className="text-slate-800">{viewingBazar.direccion}, {viewingBazar.distrito} - {viewingBazar.provincia}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Línea de Crédito Defecto</span>
                  <span className="font-mono font-semibold text-slate-900">S/ {viewingBazar.lineaPorDefecto.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Día de Corte Defecto</span>
                  <span className="font-mono text-slate-900">Día {viewingBazar.diaCorteDefecto} cada mes</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setViewingBazar(null)}
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
