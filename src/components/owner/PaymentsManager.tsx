import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  User,
  ShieldCheck,
  Calendar,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Liquidation, InstallmentLoan, PaymentRecord } from '../../types';
import {
  calculatePaymentPrelacion,
  formatCurrency,
  formatRatePercent,
  roundMoney,
} from '../../utils/finance';
import { HelpButton } from '../common/ContextualHelp';
import { ConfirmationModal } from '../common/ToastContainer';

interface PaymentsManagerProps {
  initialLiquidationId?: string;
  onFinishPayment?: () => void;
}

export const PaymentsManager: React.FC<PaymentsManagerProps> = ({
  initialLiquidationId,
  onFinishPayment,
}) => {
  const {
    clients,
    liquidations,
    installmentLoans,
    payments,
    currentBazar,
    executePayment,
  } = useApp();

  // Pending obligations list
  const pendingLiquidations = liquidations.filter(
    (l) => l.bazarId === currentBazar.id && l.estado !== 'Pagado'
  );

  const activeLoans = installmentLoans.filter(
    (loan) =>
      loan.bazarId === currentBazar.id &&
      loan.cronograma.some((row) => row.estado !== 'Pagada')
  );

  // Form State
  const [obligationType, setObligationType] = useState<'Fin_De_Mes' | 'Cuota'>(
    'Fin_De_Mes'
  );
  const [selectedLiquidationId, setSelectedLiquidationId] = useState<string>(
    initialLiquidationId || pendingLiquidations[0]?.id || ''
  );
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    activeLoans[0]?.id || ''
  );
  const [selectedCuotaNum, setSelectedCuotaNum] = useState<number>(1);

  // Payment form inputs
  const [montoAbonado, setMontoAbonado] = useState<number>(0);
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'Transferencia' | 'Yape/Plin'>('Yape/Plin');
  const [nroOperacion, setNroOperacion] = useState<string>('OP-' + Math.floor(100000 + Math.random() * 900000));
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [voucherPayment, setVoucherPayment] = useState<PaymentRecord | null>(null);

  // Find current obligation object
  const currentLiquidation = liquidations.find((l) => l.id === selectedLiquidationId);
  const currentLoan = installmentLoans.find((l) => l.id === selectedLoanId);
  const nextCuotaRow = currentLoan?.cronograma.find((r) => r.estado !== 'Pagada');

  // Pre-load exact total whenever selection changes
  useEffect(() => {
    if (obligationType === 'Fin_De_Mes' && currentLiquidation) {
      setMontoAbonado(currentLiquidation.montoTotalExigible);
      setErrorMsg('');
    } else if (obligationType === 'Cuota' && nextCuotaRow) {
      setMontoAbonado(nextCuotaRow.cuota);
      setSelectedCuotaNum(nextCuotaRow.numeroCuota);
      setErrorMsg('');
    }
  }, [obligationType, selectedLiquidationId, selectedLoanId, nextCuotaRow?.numeroCuota]);

  // Active client
  const activeClientId =
    obligationType === 'Fin_De_Mes'
      ? currentLiquidation?.clienteId
      : currentLoan?.clienteId;
  const client = clients.find((c) => c.id === activeClientId);

  // Calculate live Prelación
  const livePrelacion = React.useMemo(() => {
    if (obligationType === 'Fin_De_Mes' && currentLiquidation) {
      return calculatePaymentPrelacion(
        montoAbonado || 0,
        currentLiquidation.interesMoratorioTotal,
        currentLiquidation.interesCompensatorioTotal,
        currentLiquidation.totalCapital
      );
    } else if (obligationType === 'Cuota' && nextCuotaRow) {
      return calculatePaymentPrelacion(
        montoAbonado || 0,
        0,
        nextCuotaRow.interes,
        nextCuotaRow.amortizacion
      );
    }
    return { mora: 0, interesCompensatorio: 0, capital: 0, totalAplicado: 0 };
  }, [obligationType, currentLiquidation, nextCuotaRow, montoAbonado]);

  // Total required
  const totalExigible =
    obligationType === 'Fin_De_Mes'
      ? currentLiquidation?.montoTotalExigible || 0
      : nextCuotaRow?.cuota || 0;

  const handleMontoChange = (val: number) => {
    setMontoAbonado(val);
    if (Math.abs(val - totalExigible) > 0.01) {
      setErrorMsg(
        'MiBazarPE no permite pagos parciales para esta obligación. El abono debe ser exactamente igual al total exigible de ' +
          formatCurrency(totalExigible)
      );
    } else {
      setErrorMsg('');
    }
  };

  const handleProcessPayment = () => {
    if (!client) return;

    if (Math.abs(montoAbonado - totalExigible) > 0.05) {
      setErrorMsg(
        'El monto a abonar debe cubrir exactamente la obligación exigible (' +
          formatCurrency(totalExigible) +
          '). No se autorizan pagos parciales.'
      );
      return;
    }

    const res = executePayment({
      clienteId: client.id,
      tipoObligacion: obligationType,
      referenciaId: obligationType === 'Fin_De_Mes' ? selectedLiquidationId : selectedLoanId,
      numeroCuota: obligationType === 'Cuota' ? selectedCuotaNum : undefined,
      montoAbonado,
      metodoPago,
      nroOperacion,
    });

    if (res.success) {
      // Find latest payment record for voucher modal
      const newPayRecord: PaymentRecord = {
        id: 'pay-receipt-' + Date.now(),
        bazarId: currentBazar.id,
        clienteId: client.id,
        tipoObligacion: obligationType,
        referenciaId: obligationType === 'Fin_De_Mes' ? selectedLiquidationId : selectedLoanId,
        numeroCuota: obligationType === 'Cuota' ? selectedCuotaNum : undefined,
        fechaPago: new Date().toISOString().split('T')[0],
        montoPagado: montoAbonado,
        prelacion: livePrelacion,
        metodoPago,
        nroOperacion,
        registradoPor: 'Cajero / Dueño del Bazar',
      };
      setVoucherPayment(newPayRecord);
      if (onFinishPayment) onFinishPayment();
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Módulo de Cobranzas y Registro de Pagos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aplicación estricta del orden legal de prelación de pagos (Ley N.º 26702) y prohibición de pagos parciales
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column (Left) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Selección de Obligación por Cancelar
              </h3>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setObligationType('Fin_De_Mes')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  obligationType === 'Fin_De_Mes'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fin de Mes
              </button>
              <button
                type="button"
                onClick={() => setObligationType('Cuota')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  obligationType === 'Cuota'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cuota Mensual
              </button>
            </div>
          </div>

          {/* Selector according to obligation type */}
          {obligationType === 'Fin_De_Mes' ? (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Liquidaciones Pendientes o en Mora:
              </label>
              {pendingLiquidations.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No hay liquidaciones mensuales pendientes en este momento.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {pendingLiquidations.map((liq) => {
                    const c = clients.find((x) => x.id === liq.clienteId);
                    const isSelected = liq.id === selectedLiquidationId;
                    return (
                      <div
                        key={liq.id}
                        onClick={() => setSelectedLiquidationId(liq.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{c?.nombres}</span>
                          <span className="text-[11px] text-slate-500">
                            Período: {liq.periodo} · Vence: {liq.fechaLimitePago}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">
                            {formatCurrency(liq.montoTotalExigible)}
                          </span>
                          {liq.estado === 'En_Mora' ? (
                            <span className="text-[10px] font-semibold text-rose-600">
                              En Mora ({liq.diasMoraTranscurridos}d)
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-600 font-medium">Pendiente</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Créditos en Cuotas Activos:
              </label>
              {activeLoans.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500">
                  No hay financiamientos en cuotas activos pendientes de abono.
                </div>
              ) : (
                <div className="space-y-2 max-h-52 overflow-y-auto">
                  {activeLoans.map((loan) => {
                    const c = clients.find((x) => x.id === loan.clienteId);
                    const nextRow = loan.cronograma.find((r) => r.estado !== 'Pagada');
                    const isSelected = loan.id === selectedLoanId;

                    return (
                      <div
                        key={loan.id}
                        onClick={() => setSelectedLoanId(loan.id)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/20'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{c?.nombres}</span>
                          <span className="text-[11px] text-slate-500">
                            Cuota {nextRow?.numeroCuota} de {loan.numeroCuotas} · Vence: {nextRow?.fechaVencimiento}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900 block">
                            {formatCurrency(nextRow?.cuota || 0)}
                          </span>
                          <span className="text-[10px] text-indigo-600 font-medium">
                            Saldo: {formatCurrency(loan.saldoPendienteActual)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Breakdown of the debt */}
          {client && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-800">
                  Titular: {client.nombres} ({client.tipoDocumento}: {client.numeroDocumento})
                </span>
                <span className="font-mono text-slate-500">
                  Línea disp: {formatCurrency(client.saldoDisponible)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Mora Acumulada</span>
                  <span className="text-rose-600 font-bold block">
                    {formatCurrency(
                      obligationType === 'Fin_De_Mes'
                        ? currentLiquidation?.interesMoratorioTotal || 0
                        : 0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Int. Compensatorio</span>
                  <span className="text-indigo-700 font-bold block">
                    {formatCurrency(
                      obligationType === 'Fin_De_Mes'
                        ? currentLiquidation?.interesCompensatorioTotal || 0
                        : nextCuotaRow?.interes || 0
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-sans">Capital Principal</span>
                  <span className="text-slate-900 font-bold block">
                    {formatCurrency(
                      obligationType === 'Fin_De_Mes'
                        ? currentLiquidation?.totalCapital || 0
                        : nextCuotaRow?.amortizacion || 0
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Input with Mandatory Full-Payment Constraint */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center">
                  <span>Monto Total a Cancelar (PEN) *</span>
                  <HelpButton topicKey="no_pagos_parciales" />
                </label>
                <span className="text-[11px] text-amber-700 font-medium">
                  Pago íntegro obligatorio
                </span>
              </div>
              <input
                type="number"
                step={0.01}
                value={montoAbonado}
                onChange={(e) => handleMontoChange(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-bold font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Error banner if trying to pay partial amount */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 space-y-1 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>PROHIBICIÓN DE PAGOS PARCIALES</span>
                </div>
                <p className="leading-relaxed">{errorMsg}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Medio de Pago *</label>
                <select
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="Yape/Plin">Billetera Digital (Yape / Plin)</option>
                  <option value="Efectivo">Efectivo en Caja</option>
                  <option value="Transferencia">Transferencia Bancaria</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">N.º de Operación / Recibo</label>
                <input
                  type="text"
                  value={nroOperacion}
                  onChange={(e) => setNroOperacion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsConfirmOpen(true)}
              disabled={!client || Boolean(errorMsg) || montoAbonado <= 0}
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all ${
                !client || Boolean(errorMsg) || montoAbonado <= 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar y Aplicar Prelación Legal</span>
            </button>
          </div>
        </div>

        {/* Legal Prelación Breakdown Column (Right) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Imputación por Prelación de Pagos
                </h3>
              </div>
              <HelpButton topicKey="prelacion_pagos" className="text-slate-400 hover:text-white" />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Conforme a la normativa financiera peruana, todo importe abonado debe extinguir las obligaciones en el orden jerárquico estricto:
            </p>

            {/* Visual Steps of Prelación */}
            <div className="space-y-3">
              {/* Step 1: Mora */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] flex items-center justify-center">
                      1
                    </span>
                    <span>1.º Intereses Moratorios</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Indemnización por días de atraso
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-rose-400">
                  {formatCurrency(livePrelacion.mora)}
                </span>
              </div>

              {/* Step 2: Compensatorio */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 font-mono text-[10px] flex items-center justify-center">
                      2
                    </span>
                    <span>2.º Intereses Compensatorios</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Retribución del crédito ordinario pactado
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-indigo-300">
                  {formatCurrency(livePrelacion.interesCompensatorio)}
                </span>
              </div>

              {/* Step 3: Capital */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center justify-center">
                      3
                    </span>
                    <span>3.º Capital Principal</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Amortización directa de la deuda original
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-emerald-400">
                  {formatCurrency(livePrelacion.capital)}
                </span>
              </div>
            </div>

            {/* Total Applied */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">Total Abono Aplicado:</span>
              <span className="font-mono font-bold text-base text-white">
                {formatCurrency(livePrelacion.totalAplicado)}
              </span>
            </div>

            {client && client.estado === 'observado_mora' && livePrelacion.mora > 0 && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Al extinguir este saldo vencido, el estado del cliente cambiará a <strong>Al Día</strong> y quedará desbloqueado para nuevas compras.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleProcessPayment}
        title="¿Confirmar Registro y Liquidación del Abono?"
        description={`Se registrará el pago total por ${formatCurrency(montoAbonado)} para ${client?.nombres} con medio de pago ${metodoPago}. La suma extinguirá ${formatCurrency(livePrelacion.mora)} en mora, ${formatCurrency(livePrelacion.interesCompensatorio)} en interés y ${formatCurrency(livePrelacion.capital)} en capital.`}
        confirmLabel="Confirmar y Extinguir Obligación"
        cancelLabel="Revisar"
      />

      {/* Payment Voucher Modal */}
      {voucherPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5 text-xs">
            <div className="text-center space-y-1 border-b border-slate-100 pb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Constancia Oficial de Abono
              </h3>
              <p className="text-slate-500 text-[11px] font-mono">
                {currentBazar.nombreComercial} · RUC {currentBazar.ruc}
              </p>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Cliente Titular:</span>
                <span className="font-semibold text-slate-900">{client?.nombres}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fecha y Hora:</span>
                <span className="font-mono">{voucherPayment.fechaPago}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Medio / Operación:</span>
                <span className="font-mono">{voucherPayment.metodoPago} ({voucherPayment.nroOperacion})</span>
              </div>

              {/* Prelacion details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[11px] mt-2">
                <span className="font-sans font-bold text-slate-900 block text-xs mb-1">
                  Imputación Legal de Fondos:
                </span>
                <div className="flex justify-between text-rose-700">
                  <span>Interés Moratorio:</span>
                  <span>{formatCurrency(voucherPayment.prelacion.mora)}</span>
                </div>
                <div className="flex justify-between text-indigo-700">
                  <span>Interés Compensatorio:</span>
                  <span>{formatCurrency(voucherPayment.prelacion.interesCompensatorio)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Amortización a Capital:</span>
                  <span>{formatCurrency(voucherPayment.prelacion.capital)}</span>
                </div>
              </div>

              <div className="flex justify-between pt-2 text-sm font-bold text-slate-950 font-mono">
                <span>TOTAL ABONADO:</span>
                <span>{formatCurrency(voucherPayment.montoPagado)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setVoucherPayment(null)}
                className="px-5 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
              >
                Cerrar Comprobante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
