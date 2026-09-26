import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Store, User, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { HelpButton } from '../common/ContextualHelp';

interface RegisterBazarWizardProps {
  onBackToLogin: () => void;
  onSuccess: () => void;
}

export const RegisterBazarWizard: React.FC<RegisterBazarWizardProps> = ({
  onBackToLogin,
  onSuccess,
}) => {
  const { createBazar } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Datos Personales
  const [nombres, setNombres] = useState('');
  const [tipoDoc, setTipoDoc] = useState<'DNI' | 'RUC'>('DNI');
  const [numDoc, setNumDoc] = useState('');
  const [telefonoPersonal, setTelefonoPersonal] = useState('');
  const [emailPersonal, setEmailPersonal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Datos del Bazar
  const [ruc, setRuc] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [nombreComercial, setNombreComercial] = useState('');
  const [direccion, setDireccion] = useState('');
  const [distrito, setDistrito] = useState('Santa Anita');
  const [provincia, setProvincia] = useState('Lima');
  const [departamento, setDepartamento] = useState('Lima');
  const [telefonoComercial, setTelefonoComercial] = useState('');
  const [correoComercial, setCorreoComercial] = useState('');

  // Step 3: Consentimiento Ley N.º 29733
  const [aceptaTerminos, setAceptaTerminos] = useState(false);

  const validateStep1 = () => {
    if (!nombres || !numDoc || !telefonoPersonal || !emailPersonal || !password) {
      setErrorMsg('Por favor complete todos los campos obligatorios del propietario.');
      return false;
    }
    if (tipoDoc === 'DNI' && numDoc.length !== 8) {
      setErrorMsg('El DNI debe contener exactamente 8 dígitos numéricos.');
      return false;
    }
    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener un mínimo de 8 caracteres.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep2 = () => {
    if (!ruc || !razonSocial || !nombreComercial || !direccion || !correoComercial) {
      setErrorMsg('Por favor complete todos los datos del bazar.');
      return false;
    }
    if (ruc.length !== 11 || !ruc.startsWith('10') && !ruc.startsWith('20')) {
      setErrorMsg('El RUC debe tener 11 dígitos y comenzar con 10 o 20.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const validateStep3 = () => {
    if (!aceptaTerminos) {
      setErrorMsg('Debe aceptar el tratamiento de datos personales bajo la Ley N.º 29733 para continuar.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
    else if (currentStep === 3 && validateStep3()) setCurrentStep(4);
  };

  const handleFinish = () => {
    createBazar({
      ruc,
      razonSocial,
      nombreComercial,
      duenoNombre: nombres,
      duenoDocumento: numDoc,
      correo: correoComercial,
      telefono: telefonoComercial || telefonoPersonal,
      direccion,
      distrito,
      provincia,
      departamento,
      estado: 'activo',
      lineaPorDefecto: 500.0,
      plazoMaxPorDefecto: 6,
      diaCorteDefecto: 20,
      diaPagoDefecto: 26,
    });
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <button
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-950 tracking-tight">
            Registro de Nuevo Bazar
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Afiliación a la plataforma de cuentas corrientes comerciales MiBazarPE
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { step: 1, label: 'Propietario' },
            { step: 2, label: 'Datos del Bazar' },
            { step: 3, label: 'Consentimiento' },
            { step: 4, label: 'Confirmación' },
          ].map((s) => (
            <div
              key={s.step}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                currentStep === s.step
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-semibold'
                  : currentStep > s.step
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <div className="text-[10px] uppercase font-mono tracking-wider">
                Paso {s.step}
              </div>
              <div className="text-xs truncate">{s.label}</div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 shadow-xl border border-slate-200 rounded-2xl">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Paso 1: Datos Personales del Dueño
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombres y Apellidos Completos *
                  </label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    placeholder="Ej. Carlos Mendoza Ramos"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipo de Documento *
                  </label>
                  <select
                    value={tipoDoc}
                    onChange={(e) => setTipoDoc(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  >
                    <option value="DNI">DNI (8 dígitos)</option>
                    <option value="RUC">RUC (11 dígitos)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    value={numDoc}
                    onChange={(e) => setNumDoc(e.target.value.replace(/\D/g, ''))}
                    placeholder="8 dígitos"
                    maxLength={tipoDoc === 'DNI' ? 8 : 11}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Teléfono Celular *
                  </label>
                  <input
                    type="tel"
                    value={telefonoPersonal}
                    onChange={(e) => setTelefonoPersonal(e.target.value)}
                    placeholder="Ej. 987654321"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Correo Personal *
                  </label>
                  <input
                    type="email"
                    value={emailPersonal}
                    onChange={(e) => setEmailPersonal(e.target.value)}
                    placeholder="carlos@correo.pe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Contraseña *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Confirmar Contraseña *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita la contraseña"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Paso 2: Datos Comerciales del Establecimiento
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    RUC Comercial (11 dígitos) *
                  </label>
                  <input
                    type="text"
                    value={ruc}
                    onChange={(e) => setRuc(e.target.value.replace(/\D/g, ''))}
                    placeholder="20XXXXXXXXX"
                    maxLength={11}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                    placeholder="Ej. Bazar & Papelería Santa Anita"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Razón Social Registrada *
                  </label>
                  <input
                    type="text"
                    value={razonSocial}
                    onChange={(e) => setRazonSocial(e.target.value)}
                    placeholder="COMERCIAL BAZAR & PAPELERÍA SANTA ANITA E.I.R.L."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Dirección Comercial *
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Los Ruiseñores 452"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Distrito *</label>
                  <input
                    type="text"
                    value={distrito}
                    onChange={(e) => setDistrito(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provincia *</label>
                  <input
                    type="text"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Correo Comercial *</label>
                  <input
                    type="email"
                    value={correoComercial}
                    onChange={(e) => setCorreoComercial(e.target.value)}
                    placeholder="contacto@bazar.pe"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Teléfono Comercial</label>
                  <input
                    type="tel"
                    value={telefonoComercial}
                    onChange={(e) => setTelefonoComercial(e.target.value)}
                    placeholder="Opcional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Paso 3: Seguridad y Tratamiento de Datos (Ley N.º 29733)
              </h3>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-700 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Cláusula de Consentimiento Informado</span>
                  <HelpButton topicKey="ley_29733" />
                </div>
                <p className="leading-relaxed text-slate-600">
                  De conformidad con la <strong>Ley N.º 29733</strong> (Ley de Protección de Datos Personales de la República del Perú) y su Reglamento, el titular autoriza expresamente a <strong>MiBazarPE</strong> a almacenar, procesar y custodiar la información comercial, crediticia y financiera registrada para los fines exclusivos del control de cuentas corrientes y liquidación de deudas.
                </p>
                <p className="leading-relaxed text-slate-600">
                  El sistema garantiza la no compartición de estos datos con terceros comerciales no autorizados y provee registros de auditoría inalterables de cada movimiento financiero.
                </p>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceptaTerminos}
                  onChange={(e) => setAceptaTerminos(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-xs text-slate-800 font-medium">
                  Acepto los términos de servicio, políticas de privacidad y el tratamiento formal de datos personales conforme a la Ley N.º 29733. *
                </span>
              </label>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                Paso 4: Resumen y Confirmación de Alta
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Propietario Registrado</span>
                  <span className="font-semibold text-slate-900 block">{nombres}</span>
                  <span className="text-slate-600 block">{tipoDoc}: {numDoc}</span>
                  <span className="text-slate-600 block">{emailPersonal}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-slate-400 block text-[11px]">Establecimiento Comercial</span>
                  <span className="font-semibold text-slate-900 block">{nombreComercial}</span>
                  <span className="text-slate-600 block">RUC: {ruc}</span>
                  <span className="text-slate-600 block">{distrito}, {provincia}</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                <span className="font-semibold block">Condiciones Financieras por Defecto:</span>
                <p className="text-slate-600">
                  Línea base: S/ 500.00 · Día de corte: 20 · Día de pago: 26 · Base comercial 360 días (Ley N.º 26702). Podrá ajustar estas políticas por cliente en cualquier momento.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Anterior
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-1.5"
              >
                <span>Siguiente</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar y Acceder al Bazar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
