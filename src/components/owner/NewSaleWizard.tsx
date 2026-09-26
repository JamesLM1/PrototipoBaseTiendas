import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  User,
  Package,
  CalendarDays,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  FileSpreadsheet,
  Clock,
  DollarSign,
  Calculator,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CartItem, CreditModality, Product } from '../../types';
import {
  calculateFinDeMesPurchase,
  calculateFrenchLoan,
  formatCurrency,
  formatRatePercent,
  getDaysDiff,
  resolveEffectiveAnnualRate,
  roundMoney,
} from '../../utils/finance';
import { HelpButton } from '../common/ContextualHelp';
import { ConfirmationModal } from '../common/ToastContainer';

interface NewSaleWizardProps {
  initialClientId?: string;
  onFinishSale: () => void;
}

export const NewSaleWizard: React.FC<NewSaleWizardProps> = ({
  initialClientId,
  onFinishSale,
}) => {
  const { clients, products, currentBazar, executePurchase, openCalculationDetail } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialClientId || clients.find((c) => c.bazarId === currentBazar.id)?.id || ''
  );
  const [clientSearch, setClientSearch] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Modality & Terms
  const [modalidad, setModalidad] = useState<CreditModality>('FIN_DE_MES');
  const [numeroCuotas, setNumeroCuotas] = useState<number>(3);
  const [fechaCompra, setFechaCompra] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [horaCompra, setHoraCompra] = useState<string>('11:00');

  // Confirmation Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Selected client object
  const client = clients.find((c) => c.id === selectedClientId);

  // Filter clients
  const availableClients = clients.filter(
    (c) =>
      c.bazarId === currentBazar.id &&
      (c.nombres.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.numeroDocumento.includes(clientSearch))
  );

  // Filter products for bazar
  const availableProducts = products.filter(
    (p) =>
      p.bazarId === currentBazar.id &&
      (p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.marca.toLowerCase().includes(productSearch.toLowerCase()))
  );

  // Cart calculations
  const totalCompra = useMemo(() => {
    return roundMoney(cart.reduce((acc, item) => acc + item.subtotal, 0));
  }, [cart]);

  const saldoDisponibleDespues = useMemo(() => {
    if (!client) return 0;
    return roundMoney(client.saldoDisponible - totalCompra);
  }, [client, totalCompra]);

  const exceedsCredit = totalCompra > (client?.saldoDisponible || 0);
  const isClientBlocked = client?.estado === 'observado_mora' || client?.estado === 'bloqueado';

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((it) => it.producto.id === product.id);
      if (existing) {
        if (existing.cantidad + 1 > product.stockActual) return prev;
        return prev.map((it) =>
          it.producto.id === product.id
            ? {
                ...it,
                cantidad: it.cantidad + 1,
                subtotal: roundMoney((it.cantidad + 1) * product.precioCredito),
              }
            : it
        );
      } else {
        if (product.stockActual < 1) return prev;
        return [
          ...prev,
          {
            producto: product,
            cantidad: 1,
            subtotal: roundMoney(product.precioCredito),
          },
        ];
      }
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.producto.id === productId) {
            const newQty = it.cantidad + delta;
            if (newQty <= 0) return null;
            if (newQty > it.producto.stockActual) return it;
            return {
              ...it,
              cantidad: newQty,
              subtotal: roundMoney(newQty * it.producto.precioCredito),
            };
          }
          return it;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCart((prev) => prev.filter((it) => it.producto.id !== productId));
  };

  // Financial Calculations for Step 4 Preview
  const financialPreview = useMemo(() => {
    if (!client || totalCompra <= 0) return null;

    const rates = resolveEffectiveAnnualRate(
      client.financiero.tipoTasa,
      client.financiero.tasaCompensatoriaAnual,
      client.financiero.capitalizacionNominal
    );
    const moraRates = resolveEffectiveAnnualRate('TEA', client.financiero.tasaMoratoriaAnual);

    const purchaseDate = new Date(fechaCompra + 'T' + horaCompra);
    const pYear = purchaseDate.getFullYear();
    const pMonth = purchaseDate.getMonth();
    const cutoffDay = client.financiero.diaCorteMensual;
    const paymentDay = client.financiero.diaPagoMensual;

    // Check cutoff
    const isPastCutoff =
      purchaseDate.getDate() > cutoffDay ||
      (purchaseDate.getDate() === cutoffDay && horaCompra > client.financiero.horaCorte);

    let targetMonth = pMonth;
    let targetYear = pYear;
    if (isPastCutoff) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    const fechaCorteCalculada = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(cutoffDay).padStart(2, '0')}`;
    const fechaPagoCalculada = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`;

    if (modalidad === 'FIN_DE_MES') {
      const calcFinMes = calculateFinDeMesPurchase({
        capital: totalCompra,
        fechaCompra,
        fechaLimitePago: fechaPagoCalculada,
        tedCompensatoria: rates.ted,
        tedMoratoria: moraRates.ted,
      });

      return {
        modalidad: 'FIN_DE_MES' as const,
        rates,
        calcFinMes,
        fechaCorteCalculada,
        fechaPagoCalculada,
        isPastCutoff,
      };
    } else {
      const calcCuotas = calculateFrenchLoan({
        montoOriginal: totalCompra,
        fechaCompra,
        fechaPrimerCorte: fechaCorteCalculada,
        diaPagoMensual: paymentDay,
        tedCompensatoria: rates.ted,
        temCompensatoria: rates.tem,
        numeroCuotas,
      });

      return {
        modalidad: 'CUOTAS' as const,
        rates,
        calcCuotas,
        fechaCorteCalculada,
        fechaPagoCalculada,
        isPastCutoff,
      };
    }
  }, [client, totalCompra, fechaCompra, horaCompra, modalidad, numeroCuotas]);

  // Open math audit drawer
  const handleOpenCalculationAudit = () => {
    if (!financialPreview || !client) return;

    if (financialPreview.modalidad === 'FIN_DE_MES') {
      const calc = financialPreview.calcFinMes;
      openCalculationDetail({
        titulo: 'Liquidación a Fin de Mes (Pago Único)',
        modalidad: 'FIN_DE_MES',
        clienteNombre: client.nombres,
        datosEntrada: {
          capitalCompra: formatCurrency(calc.capital),
          fechaCompra: calc.fechaCompra,
          fechaLimitePago: calc.fechaLimitePago,
          diasCompensatorios: `${calc.diasCompensatorios} días`,
          tasaPactada: `${client.financiero.tipoTasa} ${(client.financiero.tasaCompensatoriaAnual * 100).toFixed(4)}%`,
          tedCompensatoria: formatRatePercent(calc.tedCompensatoria, 7),
        },
        pasos: [
          {
            paso: '1. Cómputo de Días Compensatorios',
            descripcion: 'Días transcurridos entre la fecha de adquisición y la fecha límite de pago mensual.',
            formula: 'días = fecha_limite_pago - fecha_compra',
            sustitucion: `días = ${calc.fechaLimitePago} - ${calc.fechaCompra}`,
            resultado: `${calc.diasCompensatorios} días calendario`,
          },
          {
            paso: '2. Determinación de la Tasa Efectiva Diaria (TED)',
            descripcion: 'Transformación de TEA anual a diaria bajo base comercial ordinaria de 360 días.',
            formula: 'TED = (1 + TEA)^(1/360) - 1',
            sustitucion: `TED = (1 + ${financialPreview.rates.tea.toFixed(8)})^(1/360) - 1`,
            resultado: formatRatePercent(calc.tedCompensatoria, 7),
          },
          {
            paso: '3. Liquidación del Interés Compensatorio Ordinario',
            descripcion: 'Aplicación del factor compuesto por los días transcurridos sobre el capital consumido.',
            formula: 'I_c = Capital × ((1 + TED)^días - 1)',
            sustitucion: `I_c = ${calc.capital.toFixed(2)} × ((1 + ${calc.tedCompensatoria.toFixed(8)})^${calc.diasCompensatorios} - 1)`,
            resultado: formatCurrency(calc.interesCompensatorio),
          },
          {
            paso: '4. Monto Total Exigible al Vencimiento',
            descripcion: 'Suma de capital financiado e interés compensatorio generado (sin mora a la fecha límite).',
            formula: 'Total = Capital + I_c',
            sustitucion: `Total = ${calc.capital.toFixed(2)} + ${calc.interesCompensatorio.toFixed(2)}`,
            resultado: formatCurrency(calc.montoTotalExigible),
          },
        ],
        resumenFinal: {
          capitalOriginal: formatCurrency(calc.capital),
          interesCompensatorio: formatCurrency(calc.interesCompensatorio),
          montoTotalExigible: formatCurrency(calc.montoTotalExigible),
          fechaVencimiento: calc.fechaLimitePago,
        },
      });
    } else {
      const calc = financialPreview.calcCuotas;
      openCalculationDetail({
        titulo: 'Crédito en Cuotas - Método Francés con Gracia Total',
        modalidad: 'CUOTAS',
        clienteNombre: client.nombres,
        datosEntrada: {
          capitalOriginal: formatCurrency(calc.montoOriginal),
          diasGraciaTotal: `${calc.diasGraciaTotal} días transcurridos hasta el corte`,
          tedDiaria: formatRatePercent(calc.ted, 7),
          temMensual: formatRatePercent(calc.tem, 7),
          numeroCuotas: `${calc.numeroCuotas} meses`,
        },
        pasos: [
          {
            paso: '1. Factor de Capitalización durante Período de Gracia Total',
            descripcion: 'Por los días calendario transcurridos entre la fecha de compra y el primer corte del ciclo comercial.',
            formula: 'Factor_gracia = (1 + TED)^días_gracia',
            sustitucion: `Factor_gracia = (1 + ${calc.ted.toFixed(8)})^${calc.diasGraciaTotal}`,
            resultado: calc.factorCapitalizacionGracia.toFixed(8),
          },
          {
            paso: '2. Capitalización del Principal Inicial (Capital Vivo P\')',
            descripcion: 'El principal inicial se incrementa por los intereses devengados durante la gracia antes de la primera cuota.',
            formula: "P' = Capital × Factor_gracia",
            sustitucion: `P' = ${calc.montoOriginal.toFixed(2)} × ${calc.factorCapitalizacionGracia.toFixed(8)}`,
            resultado: formatCurrency(calc.capitalVivoInicial),
          },
          {
            paso: '3. Interés de Gracia Devengado Acumulado',
            descripcion: "Diferencia patrimonial que se incorpora al saldo insoluto de la deuda (P' - P).",
            formula: "I_gracia = P' - Capital",
            sustitucion: `I_gracia = ${calc.capitalVivoInicial.toFixed(2)} - ${calc.montoOriginal.toFixed(2)}`,
            resultado: formatCurrency(calc.interesGraciaAcumulado),
          },
          {
            paso: '4. Factor de Recuperación del Capital (FRC Francés)',
            descripcion: 'Coeficiente de anualidad ordinaria vencida para n cuotas mensuales con periodicidad TEM.',
            formula: 'FRC = [TEM × (1 + TEM)^n] / [(1 + TEM)^n - 1]',
            sustitucion: `FRC = [${calc.tem.toFixed(8)} × (1 + ${calc.tem.toFixed(8)})^${calc.numeroCuotas}] / [(1 + ${calc.tem.toFixed(8)})^${calc.numeroCuotas} - 1]`,
            resultado: calc.factorRecuperacionCapital.toFixed(8),
          },
          {
            paso: '5. Determinación de la Cuota Fija Mensual Uniforme (C)',
            descripcion: 'Importe constante periódico a transferir por el cliente en cada mes financiado.',
            formula: "C = P' × FRC",
            sustitucion: `C = ${calc.capitalVivoInicial.toFixed(2)} × ${calc.factorRecuperacionCapital.toFixed(8)}`,
            resultado: formatCurrency(calc.montoCuotaFija),
          },
        ],
        resumenFinal: {
          capitalOriginal: formatCurrency(calc.montoOriginal),
          capitalCapitalizadoGracia: formatCurrency(calc.capitalVivoInicial),
          interesGraciaAcumulado: formatCurrency(calc.interesGraciaAcumulado),
          cuotaMensualFija: formatCurrency(calc.montoCuotaFija),
          totalInteresesFinanciamiento: formatCurrency(calc.totalInteresesProyectados),
        },
      });
    }
  };

  const handleConfirmSale = () => {
    if (!client) return;
    const res = executePurchase({
      clienteId: client.id,
      items: cart,
      modalidad,
      numeroCuotas: modalidad === 'CUOTAS' ? numeroCuotas : undefined,
      fechaCompra,
      horaCompra: horaCompra + ':00',
    });

    if (res.success) {
      onFinishSale();
    }
  };

  return (
    <div className="space-y-6">
      {/* Wizard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nueva Venta al Crédito Comercial
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro estructurado en 4 pasos con validación de límites, existencias y simulación matemática
          </p>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {[
            { num: 1, label: 'Cliente' },
            { num: 2, label: 'Productos' },
            { num: 3, label: 'Modalidad' },
            { num: 4, label: 'Vista Previa' },
          ].map((s) => (
            <div
              key={s.num}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentStep === s.num
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : currentStep > s.num
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-400'
              }`}
            >
              <span>{s.num}.</span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECCIONAR CLIENTE */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Paso 1: Identificación del Cliente y Estado Crediticio
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Seleccione el cliente titular de la cuenta corriente
              </span>
            </div>

            {/* Client Search */}
            <div className="relative max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Buscar por DNI o nombres del cliente..."
                className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableClients.map((c) => {
                const isSelected = c.id === selectedClientId;
                const isDelinquent = c.estado === 'observado_mora';

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedClientId(c.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{c.nombres}</span>
                        <span className="text-[11px] font-mono text-slate-500 block">
                          {c.tipoDocumento}: {c.numeroDocumento}
                        </span>
                      </div>
                      {isDelinquent ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          En Mora
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Al Día
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-1 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Línea Máx:</span>
                        <span className="font-mono text-slate-700 font-medium">
                          {formatCurrency(c.financiero.lineaCreditoMax)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Disponible:</span>
                        <span className="font-mono text-emerald-700 font-bold">
                          {formatCurrency(c.saldoDisponible)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MANDATORY DELINQUENCY BLOCK BANNER */}
            {client && isClientBlocked && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>CLIENTE CON OBLIGACIONES VENCIDAS — VENTA BLOQUEADA</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  El cliente <strong>{client.nombres}</strong> presenta una deuda vencida de{' '}
                  <strong>{formatCurrency(client.deudaVencida)}</strong>. De acuerdo con las normas de
                  crédito y políticas de MiBazarPE, no se autorizan nuevas compras al crédito mientras
                  existan obligaciones impagas en mora.
                </p>
                <div className="text-[11px] text-rose-800 font-medium">
                  → Por favor diríjase al módulo de <strong>Cobranzas & Pagos</strong> para regularizar la cuenta antes de proceder.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!client || isClientBlocked}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
                !client || isClientBlocked
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              }`}
            >
              <span>Continuar a Selección de Artículos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECCIONAR PRODUCTOS */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Catalog list (Left) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Catálogo de Artículos Disponibles
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">
                  Precios valorizados al crédito
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar artículo en existencias..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {availableProducts.map((p) => {
                  const inCart = cart.find((it) => it.producto.id === p.id);
                  const isOutOfStock = p.stockActual <= 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between transition-colors text-xs"
                    >
                      <div className="space-y-0.5 max-w-xs">
                        <span className="font-semibold text-slate-900 block">{p.nombre}</span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono">{p.sku}</span>
                          <span>·</span>
                          <span>{p.marca}</span>
                          <span>·</span>
                          <span className={p.stockActual <= p.stockMinimo ? 'text-amber-600 font-medium' : ''}>
                            Stock: {p.stockActual}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="font-bold text-indigo-700 block">
                            {formatCurrency(p.precioCredito)}
                          </span>
                          <span className="text-[10px] text-slate-400">crédito</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAddToCart(p)}
                          disabled={isOutOfStock || (inCart ? inCart.cantidad >= p.stockActual : false)}
                          className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                            isOutOfStock
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{inCart ? `(${inCart.cantidad})` : 'Agregar'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart & Realtime Limit Evaluation (Right) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Detalle de Compra en Curso
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{cart.length} ítems</span>
                </div>

                {cart.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    El carrito de crédito se encuentra vacío. Seleccione productos del catálogo.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-xs">
                    {cart.map((item) => (
                      <div key={item.producto.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-slate-800 block truncate">
                            {item.producto.nombre}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {item.cantidad} x {formatCurrency(item.producto.precioCredito)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleUpdateQty(item.producto.id, -1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold text-xs w-5 text-center">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => handleUpdateQty(item.producto.id, 1)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <span className="font-mono font-bold text-slate-900 w-16 text-right">
                            {formatCurrency(item.subtotal)}
                          </span>

                          <button
                            onClick={() => handleRemoveItem(item.producto.id)}
                            className="text-slate-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtotal & Credit summary */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Línea Disponible Actual:</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(client?.saldoDisponible || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-sm">
                    <span>Subtotal de Compra:</span>
                    <span className="font-mono text-indigo-700">
                      {formatCurrency(totalCompra)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Línea Restante Estimada:</span>
                    <span
                      className={`font-mono font-bold ${
                        saldoDisponibleDespues < 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      {formatCurrency(saldoDisponibleDespues)}
                    </span>
                  </div>
                </div>

                {/* MANDATORY CREDIT EXCEEDED BLOCK BANNER */}
                {exceedsCredit && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs space-y-1 animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>OPERACIÓN EXCEDE LÍNEA DE CRÉDITO</span>
                    </div>
                    <p className="leading-snug text-rose-700">
                      Línea disponible: <strong>{formatCurrency(client?.saldoDisponible || 0)}</strong>.
                      Importe compra: <strong>{formatCurrency(totalCompra)}</strong>.
                      Exceso no autorizado: <strong>{formatCurrency(totalCompra - (client?.saldoDisponible || 0))}</strong>.
                    </p>
                    <p className="text-[11px] font-medium text-rose-800">
                      Disminuya cantidades o elimine productos para proceder.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar a Cliente</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={cart.length === 0 || exceedsCredit}
              className={`px-5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all ${
                cart.length === 0 || exceedsCredit
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              }`}
            >
              <span>Continuar a Modalidad de Pago</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: MODALIDAD DE PAGO */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Paso 3: Elección de Modalidad Financiera
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Monto a financiar: <strong className="font-mono text-slate-900">{formatCurrency(totalCompra)}</strong>
              </span>
            </div>

            {/* Modality cards selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option 1: Fin de Mes */}
              <div
                onClick={() => setModalidad('FIN_DE_MES')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  modalidad === 'FIN_DE_MES'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <span>Pago a Fin de Mes (Pago Único)</span>
                    <HelpButton topicKey="fin_de_mes" />
                  </div>
                  <input
                    type="radio"
                    name="modality"
                    checked={modalidad === 'FIN_DE_MES'}
                    onChange={() => setModalidad('FIN_DE_MES')}
                    className="w-4 h-4 text-indigo-600"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  La compra se acumula en el ciclo de facturación mensual del cliente. Se calculan intereses compensatorios por los días transcurridos hasta la fecha pactada. Requiere abono íntegro (sin pagos parciales).
                </p>
                <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>Día de corte del cliente: <strong>Día {client?.financiero.diaCorteMensual}</strong></div>
                  <div>Fecha límite de pago: <strong>Día {client?.financiero.diaPagoMensual}</strong></div>
                </div>
              </div>

              {/* Option 2: Cuotas */}
              <div
                onClick={() => setModalidad('CUOTAS')}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  modalidad === 'CUOTAS'
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <CalendarDays className="w-4 h-4 text-indigo-600" />
                    <span>Pago en Cuotas Mensuales (Método Francés)</span>
                    <HelpButton topicKey="cuotas_frances" />
                  </div>
                  <input
                    type="radio"
                    name="modality"
                    checked={modalidad === 'CUOTAS'}
                    onChange={() => setModalidad('CUOTAS')}
                    className="w-4 h-4 text-indigo-600"
                  />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Financiamiento en cuotas uniformes vencidas calculadas con la TEM equivalente. Contempla la capitalización por días de gracia total transcurridos hasta el primer corte del ciclo.
                </p>

                {modalidad === 'CUOTAS' && (
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                    <label className="font-semibold text-xs text-indigo-950 block">
                      Seleccione Número de Cuotas (Máximo permitido: {client?.financiero.plazoMaximoMeses} meses):
                    </label>
                    <select
                      value={numeroCuotas}
                      onChange={(e) => setNumeroCuotas(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-semibold text-indigo-900 font-mono"
                    >
                      {Array.from(
                        { length: (client?.financiero.plazoMaximoMeses || 6) - 1 },
                        (_, idx) => idx + 2
                      ).map((n) => (
                        <option key={n} value={n}>
                          {n} Cuotas Mensuales Consecutivas
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Date & Time of Purchase */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Fecha de la Compra</label>
                <input
                  type="date"
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hora de la Transacción</label>
                <input
                  type="time"
                  value={horaCompra}
                  onChange={(e) => setHoraCompra(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Hora de corte del cliente: {client?.financiero.horaCorte} hrs.
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar a Productos</span>
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xs flex items-center gap-2"
            >
              <span>Continuar a Vista Previa Financiera</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: VISTA PREVIA FINANCIERA */}
      {currentStep === 4 && financialPreview && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Paso 4: Vista Previa y Simulación Financiera
                </h3>
                <p className="text-xs text-slate-500">
                  Comprobación matemática bajo Ley N.º 26702 (360/30) antes del registro definitivo
                </p>
              </div>
              <button
                onClick={handleOpenCalculationAudit}
                className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1.5 transition-colors self-start"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Ver detalle del cálculo (7 dec.)</span>
              </button>
            </div>

            {/* Cycle warning if past cutoff */}
            {financialPreview.isPastCutoff && (
              <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Compra registrada posterior a la fecha y hora de corte (Día {client?.financiero.diaCorteMensual} a las {client?.financiero.horaCorte} hrs). Se imputa automáticamente a la liquidación del siguiente ciclo mensual.
                </span>
              </div>
            )}

            {/* IF FIN DE MES */}
            {financialPreview.modalidad === 'FIN_DE_MES' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Capital Principal</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {formatCurrency(financialPreview.calcFinMes.capital)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Días Compensatorios</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {financialPreview.calcFinMes.diasCompensatorios} días
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Interés Compensatorio</span>
                    <span className="text-sm font-bold font-mono text-indigo-700 mt-0.5 block">
                      {formatCurrency(financialPreview.calcFinMes.interesCompensatorio)}
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <span className="text-[10px] text-indigo-600 font-semibold block">Total a Pagar Estimado</span>
                    <span className="text-base font-bold font-mono text-indigo-950 mt-0.5 block">
                      {formatCurrency(financialPreview.calcFinMes.montoTotalExigible)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
                  <div className="flex justify-between">
                    <span>Tasa Efectiva Diaria Equivalente (TED):</span>
                    <span className="font-mono font-medium text-slate-900">
                      {formatRatePercent(financialPreview.calcFinMes.tedCompensatoria, 7)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha Límite de Pago sin Mora:</span>
                    <span className="font-mono font-semibold text-slate-900">
                      {financialPreview.calcFinMes.fechaLimitePago}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                    <span>Regla de Cancelación:</span>
                    <span>Pago total obligatorio (No admite pagos parciales en cuenta corriente).</span>
                  </div>
                </div>
              </div>
            )}

            {/* IF CUOTAS (FRANCÉS) */}
            {financialPreview.modalidad === 'CUOTAS' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Capital Original</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {formatCurrency(financialPreview.calcCuotas.montoOriginal)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Días Gracia Total</span>
                    <span className="text-sm font-bold font-mono text-slate-900 mt-0.5 block">
                      {financialPreview.calcCuotas.diasGraciaTotal} días
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Capital Capitalizado (P')</span>
                    <span className="text-sm font-bold font-mono text-indigo-700 mt-0.5 block">
                      {formatCurrency(financialPreview.calcCuotas.capitalVivoInicial)}
                    </span>
                    <span className="text-[10px] text-indigo-600 block">
                      (+{formatCurrency(financialPreview.calcCuotas.interesGraciaAcumulado)} gracia)
                    </span>
                  </div>
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                    <span className="text-[10px] text-indigo-600 font-semibold block">Cuota Mensual Fija</span>
                    <span className="text-base font-bold font-mono text-indigo-950 mt-0.5 block">
                      {formatCurrency(financialPreview.calcCuotas.montoCuotaFija)}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      x {financialPreview.calcCuotas.numeroCuotas} meses
                    </span>
                  </div>
                </div>

                {/* Cronograma Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Cronograma de Pagos Proyectado (Método Francés Vencido)</span>
                    <span className="text-[11px] font-mono text-slate-500">
                      TEM: {formatRatePercent(financialPreview.calcCuotas.tem, 7)}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                        <tr>
                          <th className="px-3 py-2 text-center">#</th>
                          <th className="px-3 py-2">Vencimiento</th>
                          <th className="px-3 py-2 text-right">Saldo Inicial</th>
                          <th className="px-3 py-2 text-right">Interés (I_k)</th>
                          <th className="px-3 py-2 text-right">Amortización (A_k)</th>
                          <th className="px-3 py-2 text-right">Cuota Fija (C)</th>
                          <th className="px-3 py-2 text-right">Saldo Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {financialPreview.calcCuotas.cronograma.map((row) => (
                          <tr key={row.numeroCuota} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2 text-center font-bold text-indigo-700">
                              {row.numeroCuota}
                            </td>
                            <td className="px-3 py-2 text-slate-700 font-sans">
                              {row.fechaVencimiento}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {formatCurrency(row.saldoInicial)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-700">
                              {formatCurrency(row.interes)}
                            </td>
                            <td className="px-3 py-2 text-right text-emerald-700 font-medium">
                              {formatCurrency(row.amortizacion)}
                            </td>
                            <td className="px-3 py-2 text-right font-bold text-slate-900">
                              {formatCurrency(row.cuota)}
                            </td>
                            <td className="px-3 py-2 text-right text-slate-600">
                              {formatCurrency(row.saldoFinal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Regresar a Modalidad</span>
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 shadow-md flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Venta al Crédito</span>
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSale}
        title="¿Confirmar Registro de Compra al Crédito?"
        description={`Se registrará la transacción por ${formatCurrency(totalCompra)} para el cliente ${client?.nombres} bajo la modalidad ${modalidad === 'FIN_DE_MES' ? 'Fin de Mes' : `Cuotas (${numeroCuotas} meses)`}. Se afectará la línea de crédito autorizada y las existencias físicas del inventario.`}
        confirmLabel="Confirmar Operación"
        cancelLabel="Revisar"
      />
    </div>
  );
};
