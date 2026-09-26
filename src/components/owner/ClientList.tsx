import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  ShoppingCart,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Client, ClientFinancialConfig, RateType, CapitalizationFrequency } from '../../types';
import { formatCurrency, formatRatePercent, resolveEffectiveAnnualRate } from '../../utils/finance';
import { HelpButton } from '../common/ContextualHelp';

interface ClientListProps {
  onStartNewSaleForClient?: (clientId: string) => void;
  onViewAccountForClient?: (clientId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  onStartNewSaleForClient,
  onViewAccountForClient,
}) => {
  const { clients, currentBazar, createClient, updateClient, openCalculationDetail } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [activeTabDetail, setActiveTabDetail] = useState<'resumen' | 'configuracion'>('resumen');

  // Form State
  const [nombres, setNombres] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'RUC' | 'CE'>('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // Financial Config Form State
  const [moneda, setMoneda] = useState<'PEN' | 'USD'>('PEN');
  const [lineaCreditoMax, setLineaCreditoMax] = useState(600);
  const [tipoTasa, setTipoTasa] = useState<RateType>('TEA');
  const [tasaCompensatoria, setTasaCompensatoria] = useState(24.0); // %
  const [capitalizacionNominal, setCapitalizacionNominal] = useState<CapitalizationFrequency>('diaria');
  const [tasaMoratoria, setTasaMoratoria] = useState(36.0); // %
  const [diaCorteMensual, setDiaCorteMensual] = useState(20);
  const [horaCorte, setHoraCorte] = useState('20:00');
  const [diaPagoMensual, setDiaPagoMensual] = useState(26);
  const [plazoMaximoMeses, setPlazoMaximoMeses] = useState(6);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingClient(null);
    setNombres('');
    setTipoDocumento('DNI');
    setNumeroDocumento('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setMoneda('PEN');
    setLineaCreditoMax(currentBazar.lineaPorDefecto || 500);
    setTipoTasa('TEA');
    setTasaCompensatoria(24.0);
    setCapitalizacionNominal('diaria');
    setTasaMoratoria(36.0);
    setDiaCorteMensual(currentBazar.diaCorteDefecto || 20);
    setHoraCorte('20:00');
    setDiaPagoMensual(currentBazar.diaPagoDefecto || 26);
    setPlazoMaximoMeses(currentBazar.plazoMaxPorDefecto || 6);
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setNombres(c.nombres);
    setTipoDocumento(c.tipoDocumento);
    setNumeroDocumento(c.numeroDocumento);
    setEmail(c.email);
    setTelefono(c.telefono);
    setDireccion(c.direccion);
    setMoneda(c.financiero.moneda);
    setLineaCreditoMax(c.financiero.lineaCreditoMax);
    setTipoTasa(c.financiero.tipoTasa);
    setTasaCompensatoria(c.financiero.tasaCompensatoriaAnual * 100);
    setCapitalizacionNominal(c.financiero.capitalizacionNominal || 'diaria');
    setTasaMoratoria(c.financiero.tasaMoratoriaAnual * 100);
    setDiaCorteMensual(c.financiero.diaCorteMensual);
    setHoraCorte(c.financiero.horaCorte);
    setDiaPagoMensual(c.financiero.diaPagoMensual);
    setPlazoMaximoMeses(c.financiero.plazoMaximoMeses);
    setFormError('');
    setIsFormOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres || !numeroDocumento || !email || !telefono) {
      setFormError('Por favor complete todos los datos personales obligatorios.');
      return;
    }

    if (tipoDocumento === 'DNI' && numeroDocumento.length !== 8) {
      setFormError('El DNI debe contener exactamente 8 dígitos.');
      return;
    }

    if (lineaCreditoMax < 50 || lineaCreditoMax > 10000) {
      setFormError('La línea máxima de crédito debe situarse entre S/ 50.00 y S/ 10,000.00.');
      return;
    }

    if (diaCorteMensual < 1 || diaCorteMensual > 28) {
      setFormError('El día de corte debe estar entre el 1 y 28 para asegurar meses uniformes.');
      return;
    }

    if (diaPagoMensual <= diaCorteMensual) {
      setFormError('El día de pago debe ser posterior al día de corte.');
      return;
    }

    if (diaPagoMensual - diaCorteMensual < 5) {
      setFormError('El día de pago debe distar al menos 5 días del corte para permitir la revisión del estado de cuenta.');
      return;
    }

    const finConfig: ClientFinancialConfig = {
      moneda,
      lineaCreditoMax: Number(lineaCreditoMax),
      tipoTasa,
      tasaCompensatoriaAnual: Number(tasaCompensatoria) / 100,
      capitalizacionNominal: tipoTasa === 'TNA' ? capitalizacionNominal : undefined,
      tasaMoratoriaAnual: Number(tasaMoratoria) / 100,
      diaCorteMensual: Number(diaCorteMensual),
      horaCorte,
      diaPagoMensual: Number(diaPagoMensual),
      plazoMaximoMeses: Number(plazoMaximoMeses),
    };

    if (editingClient) {
      updateClient(editingClient.id, {
        nombres,
        tipoDocumento,
        numeroDocumento,
        email,
        telefono,
        direccion,
        financiero: finConfig,
      });
    } else {
      createClient({
        bazarId: currentBazar.id,
        nombres,
        tipoDocumento,
        numeroDocumento,
        email,
        telefono,
        direccion,
        estado: 'al_dia',
        financiero: finConfig,
      });
    }

    setIsFormOpen(false);
  };

  const filteredClients = clients
    .filter((c) => c.bazarId === currentBazar.id)
    .filter((c) => {
      const matchesSearch =
        c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numeroDocumento.includes(searchTerm) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'todos' ? true : c.estado === filterStatus;

      return matchesSearch && matchesStatus;
    });

  const handleAuditRates = (client: Client) => {
    const res = resolveEffectiveAnnualRate(
      client.financiero.tipoTasa,
      client.financiero.tasaCompensatoriaAnual,
      client.financiero.capitalizacionNominal
    );
    const moraRes = resolveEffectiveAnnualRate('TEA', client.financiero.tasaMoratoriaAnual);

    openCalculationDetail({
      titulo: 'Homogeneización y Equivalencia de Tasas',
      modalidad: 'CONVERSION_TASA',
      clienteNombre: client.nombres,
      datosEntrada: {
        tipoTasaPactada: client.financiero.tipoTasa,
        tasaCompensatoriaAnual: `${(client.financiero.tasaCompensatoriaAnual * 100).toFixed(4)}%`,
        capitalizacion: client.financiero.capitalizacionNominal || 'N/A (Tasa Efectiva)',
        tasaMoratoriaPactada: `${(client.financiero.tasaMoratoriaAnual * 100).toFixed(4)}%`,
        baseCalculo: '360 días (Año comercial Ley N.º 26702, Art. 9)',
      },
      pasos: [
        {
          paso: '1. Determinación de la Tasa Efectiva Anual (TEA)',
          descripcion: res.formulaExplicacion,
          formula: client.financiero.tipoTasa === 'TNA' ? 'TEA = (1 + TNA/m)^m - 1' : 'TEA = Tasa pactada',
          resultado: formatRatePercent(res.tea, 7),
        },
        {
          paso: '2. Cálculo de la Tasa Efectiva Diaria (TED Compensatoria)',
          descripcion: 'Tasa requerida para liquidar intereses ordinarios por días exactos transcurridos en base 360 días.',
          formula: 'TED = (1 + TEA)^(1/360) - 1',
          sustitucion: `TED = (1 + ${res.tea.toFixed(8)})^(1/360) - 1`,
          resultado: formatRatePercent(res.ted, 7),
        },
        {
          paso: '3. Cálculo de la Tasa Efectiva Mensual (TEM Compensatoria)',
          descripcion: 'Tasa periódica comercial uniforme para amortización de cuotas mediante el método francés (mes de 30 días).',
          formula: 'TEM = (1 + TEA)^(30/360) - 1',
          sustitucion: `TEM = (1 + ${res.tea.toFixed(8)})^(30/360) - 1`,
          resultado: formatRatePercent(res.tem, 7),
        },
        {
          paso: '4. Tasa Diaria Moratoria (TED Mora)',
          descripcion: 'Tasa aplicable de manera aislada e independiente sobre deudas en mora por días de atraso.',
          formula: 'TED_mora = (1 + TEA_mora)^(1/360) - 1',
          sustitucion: `TED_mora = (1 + ${moraRes.tea.toFixed(8)})^(1/360) - 1`,
          resultado: formatRatePercent(moraRes.ted, 7),
        },
      ],
      resumenFinal: {
        TEA_Compensatoria: formatRatePercent(res.tea, 7),
        TED_Compensatoria: formatRatePercent(res.ted, 7),
        TEM_Compensatoria: formatRatePercent(res.tem, 7),
        TED_Moratoria: formatRatePercent(moraRes.ted, 7),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Gestión de Clientes y Líneas de Crédito
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Asignación de límites individuales, configuración de tasas TEA/TNA y fechas de corte
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por DNI, nombres o correo..."
            className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium shrink-0">Estado:</span>
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'al_dia', label: 'Al Día' },
            { id: 'observado_mora', label: 'En Mora' },
            { id: 'bloqueado', label: 'Bloqueado' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setFilterStatus(st.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                filterStatus === st.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
              <tr>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3 text-right">Línea Máx.</th>
                <th className="px-4 py-3 text-right">Utilizado</th>
                <th className="px-4 py-3 text-right">Disponible</th>
                <th className="px-4 py-3">Corte / Pago</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    No se encontraron clientes registrados con los filtros activos.
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => {
                  const usedPct = Math.min(
                    100,
                    Math.round((c.creditoUtilizado / (c.financiero.lineaCreditoMax || 1)) * 100)
                  );

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{c.nombres}</span>
                        <span className="text-[11px] text-slate-500 block truncate max-w-[180px]">
                          {c.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {c.tipoDocumento}: {c.numeroDocumento}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                        {formatCurrency(c.financiero.lineaCreditoMax, c.financiero.moneda)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-indigo-700">
                        {formatCurrency(c.creditoUtilizado, c.financiero.moneda)}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {usedPct}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {formatCurrency(c.saldoDisponible, c.financiero.moneda)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="block">Corte: Día {c.financiero.diaCorteMensual}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Pago: Día {c.financiero.diaPagoMensual} ({c.financiero.horaCorte})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.estado === 'al_dia' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Al Día
                          </span>
                        )}
                        {c.estado === 'observado_mora' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            En Mora (Bloq.)
                          </span>
                        )}
                        {c.estado === 'bloqueado' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-300">
                            Bloqueado
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewingClient(c)}
                            title="Ver ficha crediticia del cliente"
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(c)}
                            title="Editar condiciones y crédito"
                            className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onStartNewSaleForClient && (
                            <button
                              onClick={() => onStartNewSaleForClient(c.id)}
                              disabled={c.estado === 'observado_mora'}
                              title={
                                c.estado === 'observado_mora'
                                  ? 'Cliente en mora: compras bloqueadas'
                                  : 'Registrar compra para este cliente'
                              }
                              className={`p-1 rounded ${
                                c.estado === 'observado_mora'
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                              }`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL P22: Registrar / Editar Cliente */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              {editingClient ? 'Modificar Condiciones del Cliente' : 'Registrar Nuevo Cliente Comercial'}
            </h3>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveClient} className="space-y-4">
              {/* Sección 1: Datos Personales */}
              <div className="space-y-2">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  1. Datos Personales
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nombres y Apellidos Completos *
                    </label>
                    <input
                      type="text"
                      value={nombres}
                      onChange={(e) => setNombres(e.target.value)}
                      placeholder="Ej. Juan Pérez García"
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Documento *</label>
                    <select
                      value={tipoDocumento}
                      onChange={(e) => setTipoDocumento(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    >
                      <option value="DNI">DNI (8 dígitos)</option>
                      <option value="RUC">RUC (11 dígitos)</option>
                      <option value="CE">Carné Extranjería</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Número de Documento *</label>
                    <input
                      type="text"
                      value={numeroDocumento}
                      onChange={(e) => setNumeroDocumento(e.target.value.replace(/\D/g, ''))}
                      maxLength={tipoDocumento === 'DNI' ? 8 : 11}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="juan.perez@correo.com"
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Teléfono Celular *</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="987654321"
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Dirección Domiciliaria</label>
                    <input
                      type="text"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Jr. Las Lilas 124, Santa Anita"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Configuración Financiera */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                    2. Condiciones Crediticias y Financieras
                  </span>
                  <span className="text-[11px] text-slate-500">Base comercial 360d / Mes 30d</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Moneda del Crédito</span>
                    </label>
                    <select
                      value={moneda}
                      onChange={(e) => setMoneda(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    >
                      <option value="PEN">Soles (PEN - S/)</option>
                      <option value="USD">Dólares (USD - $)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Línea Máxima de Crédito (S/)</span>
                      <HelpButton topicKey="linea_credito" />
                    </label>
                    <input
                      type="number"
                      value={lineaCreditoMax}
                      onChange={(e) => setLineaCreditoMax(Number(e.target.value))}
                      min={50}
                      max={10000}
                      step={10}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono font-semibold"
                    />
                    <span className="text-[10px] text-slate-400">Rango: S/ 50.00 a S/ 10,000.00</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Tipo de Tasa Compensatoria</span>
                      <HelpButton topicKey="tea" />
                    </label>
                    <select
                      value={tipoTasa}
                      onChange={(e) => setTipoTasa(e.target.value as RateType)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-semibold"
                    >
                      <option value="TEA">TEA (Tasa Efectiva Anual)</option>
                      <option value="TNA">TNA (Tasa Nominal Anual con capitalización)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>{tipoTasa} Compensatoria Anual (%)</span>
                      <HelpButton topicKey={tipoTasa === 'TEA' ? 'tea' : 'tna'} />
                    </label>
                    <input
                      type="number"
                      value={tasaCompensatoria}
                      onChange={(e) => setTasaCompensatoria(Number(e.target.value))}
                      min={1}
                      max={150}
                      step={0.01}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  {/* Dinámicamente solicitado si es TNA */}
                  {tipoTasa === 'TNA' && (
                    <div className="sm:col-span-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                      <label className="font-semibold text-amber-900 flex items-center">
                        <span>Período de Capitalización Nominal (m) *</span>
                        <HelpButton topicKey="capitalizacion" />
                      </label>
                      <select
                        value={capitalizacionNominal}
                        onChange={(e) => setCapitalizacionNominal(e.target.value as CapitalizationFrequency)}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-slate-800 font-medium"
                      >
                        <option value="diaria">Diaria (m = 360 al año)</option>
                        <option value="mensual">Mensual (m = 12 al año)</option>
                        <option value="bimestral">Bimestral (m = 6 al año)</option>
                        <option value="trimestral">Trimestral (m = 4 al año)</option>
                        <option value="cuatrimestral">Cuatrimestral (m = 3 al año)</option>
                        <option value="semestral">Semestral (m = 2 al año)</option>
                        <option value="anual">Anual (m = 1 al año)</option>
                      </select>
                      <p className="text-[10px] text-amber-800">
                        La TNA requiere especificar m para ser convertida a TEA equivalente bajo la fórmula TEA = (1 + TNA/m)^m - 1.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Tasa Moratoria Anual (%)</span>
                      <HelpButton topicKey="tasa_moratoria" />
                    </label>
                    <input
                      type="number"
                      value={tasaMoratoria}
                      onChange={(e) => setTasaMoratoria(Number(e.target.value))}
                      min={1}
                      max={200}
                      step={0.01}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Plazo Máximo en Cuotas</span>
                      <HelpButton topicKey="cuotas_frances" />
                    </label>
                    <select
                      value={plazoMaximoMeses}
                      onChange={(e) => setPlazoMaximoMeses(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10, 12].map((m) => (
                        <option key={m} value={m}>
                          {m} {m === 1 ? 'Mes' : 'Meses'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Día de Corte Mensual (1-28)</span>
                      <HelpButton topicKey="dia_corte" />
                    </label>
                    <input
                      type="number"
                      value={diaCorteMensual}
                      onChange={(e) => setDiaCorteMensual(Number(e.target.value))}
                      min={1}
                      max={28}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Hora Límite de Corte</span>
                      <HelpButton topicKey="dia_corte" />
                    </label>
                    <input
                      type="time"
                      value={horaCorte}
                      onChange={(e) => setHoraCorte(e.target.value)}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 flex items-center mb-1">
                      <span>Día de Pago Mensual (1-30)</span>
                      <HelpButton topicKey="dia_pago" />
                    </label>
                    <input
                      type="number"
                      value={diaPagoMensual}
                      onChange={(e) => setDiaPagoMensual(Number(e.target.value))}
                      min={1}
                      max={30}
                      required
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                    />
                    <span className="text-[10px] text-slate-400">Debe ser &gt; día de corte en al menos 5 días</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL P23: Detalle / Ficha del Cliente */}
      {viewingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingClient.nombres}</h3>
                <p className="text-slate-500 font-mono text-[11px]">
                  {viewingClient.tipoDocumento}: {viewingClient.numeroDocumento} · Registrado el {viewingClient.fechaRegistro}
                </p>
              </div>
              <div>
                {viewingClient.estado === 'al_dia' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Al Día
                  </span>
                )}
                {viewingClient.estado === 'observado_mora' && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    En Mora
                  </span>
                )}
              </div>
            </div>

            {/* Credit cards metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Línea Aprobada</span>
                <span className="text-sm font-bold font-mono text-slate-900 block mt-0.5">
                  {formatCurrency(viewingClient.financiero.lineaCreditoMax, viewingClient.financiero.moneda)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Crédito Utilizado</span>
                <span className="text-sm font-bold font-mono text-indigo-700 block mt-0.5">
                  {formatCurrency(viewingClient.creditoUtilizado, viewingClient.financiero.moneda)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Disponible</span>
                <span className="text-sm font-bold font-mono text-emerald-700 block mt-0.5">
                  {formatCurrency(viewingClient.saldoDisponible, viewingClient.financiero.moneda)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Deuda Vencida</span>
                <span className="text-sm font-bold font-mono text-rose-700 block mt-0.5">
                  {formatCurrency(viewingClient.deudaVencida, viewingClient.financiero.moneda)}
                </span>
              </div>
            </div>

            {/* Progress bar % */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
                <span>Utilización de Línea</span>
                <span className="font-mono">
                  {((viewingClient.creditoUtilizado / (viewingClient.financiero.lineaCreditoMax || 1)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      (viewingClient.creditoUtilizado / (viewingClient.financiero.lineaCreditoMax || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Financial Config Review */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 text-xs">
                  Condiciones Crediticias Vigentes
                </span>
                <button
                  onClick={() => handleAuditRates(viewingClient)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Ver detalle de tasas (7 dec.)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tasa Compensatoria</span>
                  <span className="font-mono font-medium">
                    {viewingClient.financiero.tipoTasa}{' '}
                    {(viewingClient.financiero.tasaCompensatoriaAnual * 100).toFixed(4)}%
                    {viewingClient.financiero.capitalizacionNominal &&
                      ` (${viewingClient.financiero.capitalizacionNominal})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tasa Moratoria Anual</span>
                  <span className="font-mono font-medium">
                    {(viewingClient.financiero.tasaMoratoriaAnual * 100).toFixed(4)}% TEA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Corte Mensual</span>
                  <span>Día {viewingClient.financiero.diaCorteMensual} ({viewingClient.financiero.horaCorte} hrs)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Día Límite de Pago</span>
                  <span>Día {viewingClient.financiero.diaPagoMensual} de cada mes</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              {onViewAccountForClient && (
                <button
                  onClick={() => {
                    setViewingClient(null);
                    onViewAccountForClient(viewingClient.id);
                  }}
                  className="px-3 py-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Ver Estado de Cuenta</span>
                </button>
              )}
              <button
                onClick={() => setViewingClient(null)}
                className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 ml-auto"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
