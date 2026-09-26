import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  HELP_TOPICS,
} from '../data/helpTopics';
import {
  INITIAL_AUDIT_LOGS,
  INITIAL_BAZARES,
  INITIAL_CLIENTS,
  INITIAL_INSTALLMENT_LOANS,
  INITIAL_LIQUIDATIONS,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_PURCHASES,
  INITIAL_USERS,
} from '../data/initialData';
import {
  AuditLog,
  Bazar,
  CartItem,
  Client,
  CreditModality,
  HelpTopic,
  InstallmentLoan,
  Liquidation,
  PaymentRecord,
  Product,
  Purchase,
  User,
  UserRole,
} from '../types';
import {
  calculateFinDeMesPurchase,
  calculateFrenchLoan,
  calculatePaymentPrelacion,
  resolveEffectiveAnnualRate,
  roundMoney,
} from '../utils/finance';

export interface ToastMessage {
  id: string;
  tipo: 'success' | 'error' | 'warning' | 'info';
  titulo: string;
  mensaje: string;
}

export interface CalculationDetailState {
  titulo: string;
  modalidad: CreditModality | 'CONVERSION_TASA' | 'MORA';
  clienteNombre: string;
  datosEntrada: Record<string, any>;
  pasos: {
    paso: string;
    descripcion: string;
    formula?: string;
    sustitucion?: string;
    resultado: string;
  }[];
  resumenFinal: Record<string, any>;
}

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  currentBazar: Bazar;
  currentClient: Client;
  bazares: Bazar[];
  products: Product[];
  clients: Client[];
  purchases: Purchase[];
  liquidations: Liquidation[];
  installmentLoans: InstallmentLoan[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
  toasts: ToastMessage[];
  activeHelpTopic: HelpTopic | null;
  activeCalculationDetail: CalculationDetailState | null;

  // Actions
  switchRole: (role: UserRole, targetClientId?: string) => void;
  setCurrentClient: (client: Client) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  openHelp: (topicKey: string) => void;
  closeHelp: () => void;
  openCalculationDetail: (detail: CalculationDetailState) => void;
  closeCalculationDetail: () => void;

  // Bazares CRUD
  createBazar: (bazarData: Omit<Bazar, 'id' | 'fechaAlta'>) => void;
  updateBazar: (id: string, updates: Partial<Bazar>) => void;
  toggleBazarStatus: (id: string) => void;

  // Products CRUD
  createProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Clients CRUD
  createClient: (clientData: Omit<Client, 'id' | 'creditoUtilizado' | 'saldoDisponible' | 'deudaVencida' | 'fechaRegistro'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;

  // Financial transactions
  executePurchase: (params: {
    clienteId: string;
    items: CartItem[];
    modalidad: CreditModality;
    numeroCuotas?: number;
    fechaCompra: string;
    horaCompra: string;
  }) => { success: boolean; error?: string };

  executePayment: (params: {
    clienteId: string;
    tipoObligacion: 'Fin_De_Mes' | 'Cuota';
    referenciaId: string; // liquidationId or loanId
    numeroCuota?: number;
    montoAbonado: number;
    metodoPago: 'Efectivo' | 'Transferencia' | 'Yape/Plin';
    nroOperacion?: string;
  }) => { success: boolean; error?: string };

  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bazares, setBazares] = useState<Bazar[]>(() => {
    const saved = localStorage.getItem('mibazar_bazares');
    return saved ? JSON.parse(saved) : INITIAL_BAZARES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mibazar_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('mibazar_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem('mibazar_purchases');
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [liquidations, setLiquidations] = useState<Liquidation[]>(() => {
    const saved = localStorage.getItem('mibazar_liquidations');
    return saved ? JSON.parse(saved) : INITIAL_LIQUIDATIONS;
  });

  const [installmentLoans, setInstallmentLoans] = useState<InstallmentLoan[]>(() => {
    const saved = localStorage.getItem('mibazar_installment_loans');
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENT_LOANS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('mibazar_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('mibazar_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('owner');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[1]); // Owner Carlos Mendoza
  const [currentBazar, setCurrentBazar] = useState<Bazar>(INITIAL_BAZARES[0]);
  const [currentClient, setCurrentClientState] = useState<Client>(INITIAL_CLIENTS[0]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeHelpTopic, setActiveHelpTopic] = useState<HelpTopic | null>(null);
  const [activeCalculationDetail, setActiveCalculationDetail] = useState<CalculationDetailState | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('mibazar_bazares', JSON.stringify(bazares));
  }, [bazares]);

  useEffect(() => {
    localStorage.setItem('mibazar_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mibazar_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('mibazar_purchases', JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem('mibazar_liquidations', JSON.stringify(liquidations));
  }, [liquidations]);

  useEffect(() => {
    localStorage.setItem('mibazar_installment_loans', JSON.stringify(installmentLoans));
  }, [installmentLoans]);

  useEffect(() => {
    localStorage.setItem('mibazar_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('mibazar_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = 'toast_' + Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openHelp = (topicKey: string) => {
    const topic = HELP_TOPICS[topicKey];
    if (topic) {
      setActiveHelpTopic(topic);
    }
  };

  const closeHelp = () => setActiveHelpTopic(null);

  const openCalculationDetail = (detail: CalculationDetailState) => {
    setActiveCalculationDetail(detail);
  };

  const closeCalculationDetail = () => setActiveCalculationDetail(null);

  const switchRole = (role: UserRole, targetClientId?: string) => {
    setCurrentRole(role);
    if (role === 'superadmin') {
      setCurrentUser(INITIAL_USERS[0]);
    } else if (role === 'owner') {
      setCurrentUser(INITIAL_USERS[1]);
      setCurrentBazar(bazares[0] || INITIAL_BAZARES[0]);
    } else if (role === 'client') {
      const selectedClient = targetClientId
        ? clients.find((c) => c.id === targetClientId) || clients[0]
        : currentClient;
      setCurrentClientState(selectedClient);
      setCurrentUser({
        id: 'usr-cli-' + selectedClient.id,
        nombre: selectedClient.nombres,
        email: selectedClient.email,
        rol: 'client',
        bazarId: selectedClient.bazarId,
        clienteId: selectedClient.id,
      });
    }
  };

  const setCurrentClient = (client: Client) => {
    setCurrentClientState(client);
  };

  // Bazares CRUD
  const createBazar = (bazarData: Omit<Bazar, 'id' | 'fechaAlta'>) => {
    const newBazar: Bazar = {
      ...bazarData,
      id: 'bazar-' + Date.now(),
      fechaAlta: new Date().toISOString().split('T')[0],
    };
    setBazares((prev) => [newBazar, ...prev]);

    // Audit Log
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      bazarId: newBazar.id,
      fechaHora: new Date().toLocaleString('es-PE'),
      usuario: currentUser.nombre,
      rol: currentRole,
      accion: 'CREAR_BAZAR',
      modulo: 'Gestión de Bazares',
      registro: `${newBazar.nombreComercial} (RUC: ${newBazar.ruc})`,
      resultado: 'Exitoso',
      valorNuevo: `Alta de establecimiento con línea por defecto S/ ${newBazar.lineaPorDefecto.toFixed(2)}`,
      ip: '190.237.10.4',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast({
      tipo: 'success',
      titulo: 'Bazar Registrado',
      mensaje: `El bazar "${newBazar.nombreComercial}" fue creado con éxito en la plataforma.`,
    });
  };

  const updateBazar = (id: string, updates: Partial<Bazar>) => {
    setBazares((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    addToast({
      tipo: 'success',
      titulo: 'Bazar Actualizado',
      mensaje: 'La información del bazar ha sido modificada correctamente.',
    });
  };

  const toggleBazarStatus = (id: string) => {
    setBazares((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const nuevoEstado = b.estado === 'activo' ? 'baja' : 'activo';
          // Audit log
          const newLog: AuditLog = {
            id: 'aud-' + Date.now(),
            bazarId: b.id,
            fechaHora: new Date().toLocaleString('es-PE'),
            usuario: currentUser.nombre,
            rol: currentRole,
            accion: nuevoEstado === 'baja' ? 'DAR_DE_BAJA_BAZAR' : 'ACTIVAR_BAZAR',
            modulo: 'Gestión de Bazares',
            registro: `${b.nombreComercial} (RUC: ${b.ruc})`,
            resultado: 'Exitoso',
            valorAnterior: `Estado: ${b.estado}`,
            valorNuevo: `Estado: ${nuevoEstado}`,
            ip: '190.237.10.4',
          };
          setAuditLogs((l) => [newLog, ...l]);
          return { ...b, estado: nuevoEstado };
        }
        return b;
      })
    );
  };

  // Products CRUD
  const createProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: 'prod-' + Date.now(),
    };
    setProducts((prev) => [newProd, ...prev]);
    addToast({
      tipo: 'success',
      titulo: 'Artículo Agregado',
      mensaje: `Se registró "${newProd.nombre}" con SKU ${newProd.sku}.`,
    });
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    addToast({
      tipo: 'success',
      titulo: 'Producto Actualizado',
      mensaje: 'Los datos del artículo han sido actualizados en catálogo.',
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast({
      tipo: 'info',
      titulo: 'Producto Eliminado',
      mensaje: 'El producto fue retirado del catálogo comercial.',
    });
  };

  // Clients CRUD
  const createClient = (
    clientData: Omit<
      Client,
      'id' | 'creditoUtilizado' | 'saldoDisponible' | 'deudaVencida' | 'fechaRegistro'
    >
  ) => {
    const newClient: Client = {
      ...clientData,
      id: 'client-' + Date.now(),
      creditoUtilizado: 0.0,
      saldoDisponible: clientData.financiero.lineaCreditoMax,
      deudaVencida: 0.0,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };
    setClients((prev) => [newClient, ...prev]);

    // Audit Log
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      bazarId: newClient.bazarId,
      fechaHora: new Date().toLocaleString('es-PE'),
      usuario: currentUser.nombre,
      rol: currentRole,
      accion: 'REGISTRAR_CLIENTE',
      modulo: 'Gestión de Clientes',
      registro: `${newClient.nombres} (${newClient.tipoDocumento}: ${newClient.numeroDocumento})`,
      resultado: 'Exitoso',
      valorNuevo: `Línea autorizada: S/ ${newClient.financiero.lineaCreditoMax.toFixed(2)} | Tasa: ${newClient.financiero.tipoTasa} ${(newClient.financiero.tasaCompensatoriaAnual * 100).toFixed(4)}%`,
      ip: '190.237.45.12',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast({
      tipo: 'success',
      titulo: 'Cliente Registrado',
      mensaje: `El cliente ${newClient.nombres} ha sido asignado con una línea de S/ ${newClient.financiero.lineaCreditoMax.toFixed(2)}.`,
    });
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updates };
          // Recompute saldoDisponible if lineaCreditoMax changed
          if (updates.financiero?.lineaCreditoMax !== undefined) {
            updated.saldoDisponible = Math.max(
              0,
              roundMoney(updates.financiero.lineaCreditoMax - updated.creditoUtilizado)
            );
          }
          return updated;
        }
        return c;
      })
    );
    addToast({
      tipo: 'success',
      titulo: 'Cliente Actualizado',
      mensaje: 'Condiciones del cliente actualizadas exitosamente.',
    });
  };

  // Transaction: Execute Purchase (Wizard Step 4 Finalization)
  const executePurchase = (params: {
    clienteId: string;
    items: CartItem[];
    modalidad: CreditModality;
    numeroCuotas?: number;
    fechaCompra: string;
    horaCompra: string;
  }): { success: boolean; error?: string } => {
    const client = clients.find((c) => c.id === params.clienteId);
    if (!client) return { success: false, error: 'Cliente no encontrado' };

    // 1. Validation: Client in mora or blocked
    if (client.estado === 'observado_mora' || client.estado === 'bloqueado') {
      return {
        success: false,
        error: 'El cliente presenta obligaciones vencidas o se encuentra bloqueado. No puede registrar nuevas compras.',
      };
    }

    // 2. Compute total amount
    const montoTotal = roundMoney(
      params.items.reduce((acc, it) => acc + it.subtotal, 0)
    );

    // 3. Validation: Credit limit
    if (montoTotal > client.saldoDisponible) {
      return {
        success: false,
        error: `La operación excede la línea de crédito disponible. Monto: S/ ${montoTotal.toFixed(2)}, Disponible: S/ ${client.saldoDisponible.toFixed(2)}. Exceso: S/ ${(montoTotal - client.saldoDisponible).toFixed(2)}.`,
      };
    }

    // 4. Validation: Stock availability
    for (const item of params.items) {
      const prod = products.find((p) => p.id === item.producto.id);
      if (!prod || prod.stockActual < item.cantidad) {
        return {
          success: false,
          error: `Stock insuficiente para el artículo "${item.producto.nombre}". Disponible: ${prod?.stockActual ?? 0}, Solicitado: ${item.cantidad}`,
        };
      }
    }

    // Decrement stock
    setProducts((prev) =>
      prev.map((p) => {
        const item = params.items.find((it) => it.producto.id === p.id);
        if (item) {
          return { ...p, stockActual: p.stockActual - item.cantidad };
        }
        return p;
      })
    );

    // Create Purchase Record
    const newPurchaseId = 'purch-' + Date.now();
    const purchaseDate = new Date(params.fechaCompra + 'T' + params.horaCompra);
    const purchaseYear = purchaseDate.getFullYear();
    const purchaseMonth = String(purchaseDate.getMonth() + 1).padStart(2, '0');
    const cicloCorte = `${purchaseYear}-${purchaseMonth}`;

    const newPurchase: Purchase = {
      id: newPurchaseId,
      bazarId: client.bazarId,
      clienteId: client.id,
      fechaCompra: params.fechaCompra,
      horaCompra: params.horaCompra,
      items: params.items.map((it) => ({
        productoId: it.producto.id,
        nombreProducto: it.producto.nombre,
        sku: it.producto.sku,
        cantidad: it.cantidad,
        precioCreditoUnitario: it.producto.precioCredito,
        subtotal: it.subtotal,
      })),
      montoTotal,
      modalidad: params.modalidad,
      numeroCuotas: params.numeroCuotas,
      liquidado: false,
      cicloCorte,
    };

    setPurchases((prev) => [newPurchase, ...prev]);

    // Financial rates resolution for client
    const rates = resolveEffectiveAnnualRate(
      client.financiero.tipoTasa,
      client.financiero.tasaCompensatoriaAnual,
      client.financiero.capitalizacionNominal
    );
    const moraRates = resolveEffectiveAnnualRate(
      'TEA',
      client.financiero.tasaMoratoriaAnual
    );

    // Financial handling by modality
    if (params.modalidad === 'FIN_DE_MES') {
      // Find or create current cycle liquidation
      // Check whether purchase falls before or after cutoff
      const cutoffDay = client.financiero.diaCorteMensual;
      const paymentDay = client.financiero.diaPagoMensual;

      const pDayNum = purchaseDate.getDate();
      const pHourStr = params.horaCompra.substring(0, 5);
      const isPastCutoff =
        pDayNum > cutoffDay ||
        (pDayNum === cutoffDay && pHourStr > client.financiero.horaCorte);

      // Determine cycle month
      let cycleTargetMonth = purchaseDate.getMonth();
      let cycleTargetYear = purchaseYear;
      if (isPastCutoff) {
        cycleTargetMonth += 1;
        if (cycleTargetMonth > 11) {
          cycleTargetMonth = 0;
          cycleTargetYear += 1;
        }
      }

      const cycleCutoffDate = `${cycleTargetYear}-${String(cycleTargetMonth + 1).padStart(2, '0')}-${String(cutoffDay).padStart(2, '0')}`;
      const cyclePaymentDate = `${cycleTargetYear}-${String(cycleTargetMonth + 1).padStart(2, '0')}-${String(paymentDay).padStart(2, '0')}`;
      const periodName = `${new Date(cycleTargetYear, cycleTargetMonth, 1).toLocaleString('es-PE', { month: 'long' })} ${cycleTargetYear}`;

      const existingLiqIndex = liquidations.findIndex(
        (l) =>
          l.clienteId === client.id &&
          l.fechaCorte === cycleCutoffDate &&
          l.estado === 'Pendiente'
      );

      // Calculate this single purchase compensatory interest
      const calcSingle = calculateFinDeMesPurchase({
        capital: montoTotal,
        fechaCompra: params.fechaCompra,
        fechaLimitePago: cyclePaymentDate,
        tedCompensatoria: rates.ted,
        tedMoratoria: moraRates.ted,
      });

      if (existingLiqIndex >= 0) {
        const existing = liquidations[existingLiqIndex];
        const updatedTotalCapital = roundMoney(existing.totalCapital + montoTotal);
        const updatedInteresComp = roundMoney(
          existing.interesCompensatorioTotal + calcSingle.interesCompensatorio
        );
        const updatedExigible = roundMoney(
          updatedTotalCapital + updatedInteresComp + existing.interesMoratorioTotal
        );

        setLiquidations((prev) =>
          prev.map((l, idx) =>
            idx === existingLiqIndex
              ? {
                  ...l,
                  comprasIds: [...l.comprasIds, newPurchaseId],
                  totalCapital: updatedTotalCapital,
                  interesCompensatorioTotal: updatedInteresComp,
                  montoTotalExigible: updatedExigible,
                }
              : l
          )
        );
      } else {
        const newLiq: Liquidation = {
          id: 'liq-' + Date.now(),
          bazarId: client.bazarId,
          clienteId: client.id,
          periodo: periodName.charAt(0).toUpperCase() + periodName.slice(1),
          fechaCorte: cycleCutoffDate,
          fechaLimitePago: cyclePaymentDate,
          comprasIds: [newPurchaseId],
          totalCapital: montoTotal,
          interesCompensatorioTotal: calcSingle.interesCompensatorio,
          interesMoratorioTotal: 0.0,
          diasMoraTranscurridos: 0,
          montoTotalExigible: calcSingle.montoTotalExigible,
          estado: 'Pendiente',
        };
        setLiquidations((prev) => [newLiq, ...prev]);
      }
    } else {
      // CUOTAS (Método Francés con Gracia Total Inicial)
      const nCuotas = params.numeroCuotas || 3;
      // Primer corte: próximo día de corte
      const cutoffDay = client.financiero.diaCorteMensual;
      let firstCutoffYear = purchaseYear;
      let firstCutoffMonth = purchaseDate.getMonth();
      if (purchaseDate.getDate() > cutoffDay) {
        firstCutoffMonth += 1;
        if (firstCutoffMonth > 11) {
          firstCutoffMonth = 0;
          firstCutoffYear += 1;
        }
      }
      const fechaPrimerCorte = `${firstCutoffYear}-${String(firstCutoffMonth + 1).padStart(2, '0')}-${String(cutoffDay).padStart(2, '0')}`;

      const frenchResult = calculateFrenchLoan({
        montoOriginal: montoTotal,
        fechaCompra: params.fechaCompra,
        fechaPrimerCorte,
        diaPagoMensual: client.financiero.diaPagoMensual,
        tedCompensatoria: rates.ted,
        temCompensatoria: rates.tem,
        numeroCuotas: nCuotas,
      });

      const newLoan: InstallmentLoan = {
        id: 'loan-' + Date.now(),
        bazarId: client.bazarId,
        clienteId: client.id,
        compraId: newPurchaseId,
        fechaInicio: params.fechaCompra,
        montoOriginal: frenchResult.montoOriginal,
        diasGraciaTotal: frenchResult.diasGraciaTotal,
        factorCapitalizacionGracia: frenchResult.factorCapitalizacionGracia,
        capitalVivoInicial: frenchResult.capitalVivoInicial,
        interesGraciaAcumulado: frenchResult.interesGraciaAcumulado,
        temCompensatoria: frenchResult.tem,
        numeroCuotas: frenchResult.numeroCuotas,
        montoCuotaFija: frenchResult.montoCuotaFija,
        cronograma: frenchResult.cronograma,
        totalInteresesProyectados: frenchResult.totalInteresesProyectados,
        saldoPendienteActual: frenchResult.capitalVivoInicial,
        cuotasPagadas: 0,
        proximaCuotaVencimiento: frenchResult.cronograma[0].fechaVencimiento,
        proximaCuotaMonto: frenchResult.cronograma[0].cuota,
        estado: 'Al_Dia',
      };

      setInstallmentLoans((prev) => [newLoan, ...prev]);
    }

    // Update Client credit usage
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === client.id) {
          const nuevoUtilizado = roundMoney(c.creditoUtilizado + montoTotal);
          const nuevoDisponible = Math.max(
            0,
            roundMoney(c.financiero.lineaCreditoMax - nuevoUtilizado)
          );
          return {
            ...c,
            creditoUtilizado: nuevoUtilizado,
            saldoDisponible: nuevoDisponible,
          };
        }
        return c;
      })
    );

    // Audit Log
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      bazarId: client.bazarId,
      fechaHora: new Date().toLocaleString('es-PE'),
      usuario: currentUser.nombre,
      rol: currentRole,
      accion: 'REGISTRAR_COMPRA',
      modulo: 'Ventas al Crédito',
      registro: `Compra #${newPurchaseId} (Cliente: ${client.nombres})`,
      resultado: 'Exitoso',
      valorAnterior: `Línea disp: S/ ${client.saldoDisponible.toFixed(2)}`,
      valorNuevo: `Línea disp: S/ ${(client.saldoDisponible - montoTotal).toFixed(2)} | Monto: S/ ${montoTotal.toFixed(2)} | Mod: ${params.modalidad}`,
      ip: '190.237.45.12',
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    addToast({
      tipo: 'success',
      titulo: 'Compra Registrada',
      mensaje: `Venta al crédito por S/ ${montoTotal.toFixed(2)} procesada exitosamente para ${client.nombres}.`,
    });

    return { success: true };
  };

  // Transaction: Execute Payment (Strictly enforces NO PARTIAL PAYMENTS and shows PRELACIÓN)
  const executePayment = (params: {
    clienteId: string;
    tipoObligacion: 'Fin_De_Mes' | 'Cuota';
    referenciaId: string;
    numeroCuota?: number;
    montoAbonado: number;
    metodoPago: 'Efectivo' | 'Transferencia' | 'Yape/Plin';
    nroOperacion?: string;
  }): { success: boolean; error?: string } => {
    const client = clients.find((c) => c.id === params.clienteId);
    if (!client) return { success: false, error: 'Cliente no encontrado' };

    let totalExigible = 0;
    let moraExigible = 0;
    let interesCompExigible = 0;
    let capitalExigible = 0;

    if (params.tipoObligacion === 'Fin_De_Mes') {
      const liq = liquidations.find((l) => l.id === params.referenciaId);
      if (!liq) return { success: false, error: 'Liquidación no encontrada' };
      if (liq.estado === 'Pagado') return { success: false, error: 'Esta liquidación ya fue cancelada.' };

      totalExigible = liq.montoTotalExigible;
      moraExigible = liq.interesMoratorioTotal;
      interesCompExigible = liq.interesCompensatorioTotal;
      capitalExigible = liq.totalCapital;

      // Validation: No partial payments allowed in Fin de Mes
      if (Math.abs(params.montoAbonado - totalExigible) > 0.01) {
        return {
          success: false,
          error: `MiBazarPE no permite pagos parciales para esta obligación. El abono debe ser exactamente igual al total exigible de S/ ${totalExigible.toFixed(2)}.`,
        };
      }

      // Calculate Prelación
      const prelacion = calculatePaymentPrelacion(
        params.montoAbonado,
        moraExigible,
        interesCompExigible,
        capitalExigible
      );

      // Mark liquidation as paid
      setLiquidations((prev) =>
        prev.map((l) =>
          l.id === liq.id
            ? {
                ...l,
                estado: 'Pagado',
                fechaPagoReal: new Date().toISOString().split('T')[0],
              }
            : l
        )
      );

      // Free client credit line by capital amount
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === client.id) {
            const nuevoUtilizado = Math.max(
              0,
              roundMoney(c.creditoUtilizado - capitalExigible)
            );
            const nuevoDisponible = Math.min(
              c.financiero.lineaCreditoMax,
              roundMoney(c.financiero.lineaCreditoMax - nuevoUtilizado)
            );
            // If client was in mora, check if all delinquent debts are clear
            const hadMora = c.deudaVencida > 0;
            return {
              ...c,
              creditoUtilizado: nuevoUtilizado,
              saldoDisponible: nuevoDisponible,
              deudaVencida: hadMora ? 0.0 : c.deudaVencida,
              estado: hadMora ? 'al_dia' : c.estado,
            };
          }
          return c;
        })
      );

      // Record Payment
      const newPayRecord: PaymentRecord = {
        id: 'pay-' + Date.now(),
        bazarId: client.bazarId,
        clienteId: client.id,
        tipoObligacion: 'Fin_De_Mes',
        referenciaId: liq.id,
        fechaPago: new Date().toISOString().split('T')[0],
        montoPagado: params.montoAbonado,
        prelacion,
        metodoPago: params.metodoPago,
        nroOperacion: params.nroOperacion,
        registradoPor: currentUser.nombre,
      };
      setPayments((prev) => [newPayRecord, ...prev]);

      // Audit Log
      const newLog: AuditLog = {
        id: 'aud-' + Date.now(),
        bazarId: client.bazarId,
        fechaHora: new Date().toLocaleString('es-PE'),
        usuario: currentUser.nombre,
        rol: currentRole,
        accion: 'REGISTRAR_PAGO',
        modulo: 'Cobranzas y Pagos',
        registro: `Liquidación #${liq.id} (Cliente: ${client.nombres})`,
        resultado: 'Exitoso',
        valorAnterior: `Deuda exigible: S/ ${totalExigible.toFixed(2)}`,
        valorNuevo: `Cancelado: S/ ${params.montoAbonado.toFixed(2)} | Prelación [Mora: S/ ${prelacion.mora.toFixed(2)}, IC: S/ ${prelacion.interesCompensatorio.toFixed(2)}, Cap: S/ ${prelacion.capital.toFixed(2)}]`,
        ip: '190.237.45.12',
      };
      setAuditLogs((prev) => [newLog, ...prev]);

      addToast({
        tipo: 'success',
        titulo: 'Liquidación Cancelada',
        mensaje: `Se registró el pago de S/ ${params.montoAbonado.toFixed(2)} aplicando el orden legal de prelación.`,
      });

      return { success: true };
    } else {
      // Cuotas
      const loan = installmentLoans.find((l) => l.id === params.referenciaId);
      if (!loan) return { success: false, error: 'Crédito no encontrado' };

      const cuotaNum = params.numeroCuota || (loan.cuotasPagadas + 1);
      const row = loan.cronograma.find((r) => r.numeroCuota === cuotaNum);
      if (!row) return { success: false, error: 'Cuota no encontrada' };
      if (row.estado === 'Pagada') return { success: false, error: 'Esta cuota ya fue cancelada.' };

      totalExigible = row.cuota;
      interesCompExigible = row.interes;
      capitalExigible = row.amortizacion;

      if (Math.abs(params.montoAbonado - totalExigible) > 0.05) {
        return {
          success: false,
          error: `En la modalidad de cuotas, el pago mensual debe coincidir con el valor de la cuota programada de S/ ${totalExigible.toFixed(2)}.`,
        };
      }

      const prelacion = calculatePaymentPrelacion(
        params.montoAbonado,
        0,
        interesCompExigible,
        capitalExigible
      );

      // Update Installment loan schedule
      setInstallmentLoans((prev) =>
        prev.map((l) => {
          if (l.id === loan.id) {
            const updatedSchedule = l.cronograma.map((r) =>
              r.numeroCuota === cuotaNum
                ? {
                    ...r,
                    estado: 'Pagada' as const,
                    fechaPagoReal: new Date().toISOString().split('T')[0],
                  }
                : r
            );
            const nuevasCuotasPagadas = l.cuotasPagadas + 1;
            const nuevoSaldoPendiente = Math.max(
              0,
              roundMoney(l.saldoPendienteActual - row.amortizacion)
            );
            const proximaFila = updatedSchedule.find((r) => r.estado !== 'Pagada');

            return {
              ...l,
              cronograma: updatedSchedule,
              cuotasPagadas: nuevasCuotasPagadas,
              saldoPendienteActual: nuevoSaldoPendiente,
              proximaCuotaVencimiento: proximaFila?.fechaVencimiento || 'Cancelado',
              proximaCuotaMonto: proximaFila?.cuota || 0.0,
              estado: nuevasCuotasPagadas === l.numeroCuotas ? 'Cancelado' : l.estado,
            };
          }
          return l;
        })
      );

      // Free client credit line by amortized capital
      setClients((prev) =>
        prev.map((c) => {
          if (c.id === client.id) {
            const nuevoUtilizado = Math.max(
              0,
              roundMoney(c.creditoUtilizado - capitalExigible)
            );
            const nuevoDisponible = Math.min(
              c.financiero.lineaCreditoMax,
              roundMoney(c.financiero.lineaCreditoMax - nuevoUtilizado)
            );
            return {
              ...c,
              creditoUtilizado: nuevoUtilizado,
              saldoDisponible: nuevoDisponible,
            };
          }
          return c;
        })
      );

      // Record Payment
      const newPayRecord: PaymentRecord = {
        id: 'pay-' + Date.now(),
        bazarId: client.bazarId,
        clienteId: client.id,
        tipoObligacion: 'Cuota',
        referenciaId: loan.id,
        numeroCuota: cuotaNum,
        fechaPago: new Date().toISOString().split('T')[0],
        montoPagado: params.montoAbonado,
        prelacion,
        metodoPago: params.metodoPago,
        nroOperacion: params.nroOperacion,
        registradoPor: currentUser.nombre,
      };
      setPayments((prev) => [newPayRecord, ...prev]);

      addToast({
        tipo: 'success',
        titulo: `Cuota ${cuotaNum} Pagada`,
        mensaje: `Cuota fija de S/ ${params.montoAbonado.toFixed(2)} amortizada correctamente.`,
      });

      return { success: true };
    }
  };

  const resetDemoData = () => {
    localStorage.removeItem('mibazar_bazares');
    localStorage.removeItem('mibazar_products');
    localStorage.removeItem('mibazar_clients');
    localStorage.removeItem('mibazar_purchases');
    localStorage.removeItem('mibazar_liquidations');
    localStorage.removeItem('mibazar_installment_loans');
    localStorage.removeItem('mibazar_payments');
    localStorage.removeItem('mibazar_audit_logs');

    setBazares(INITIAL_BAZARES);
    setProducts(INITIAL_PRODUCTS);
    setClients(INITIAL_CLIENTS);
    setPurchases(INITIAL_PURCHASES);
    setLiquidations(INITIAL_LIQUIDATIONS);
    setInstallmentLoans(INITIAL_INSTALLMENT_LOANS);
    setPayments(INITIAL_PAYMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setCurrentRole('owner');
    setCurrentUser(INITIAL_USERS[1]);
    setCurrentBazar(INITIAL_BAZARES[0]);
    setCurrentClientState(INITIAL_CLIENTS[0]);

    addToast({
      tipo: 'info',
      titulo: 'Datos Reiniciados',
      mensaje: 'Se han restaurado los casos de prueba y estados iniciales de MiBazarPE.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        currentBazar,
        currentClient,
        bazares,
        products,
        clients,
        purchases,
        liquidations,
        installmentLoans,
        payments,
        auditLogs,
        toasts,
        activeHelpTopic,
        activeCalculationDetail,
        switchRole,
        setCurrentClient,
        addToast,
        removeToast,
        openHelp,
        closeHelp,
        openCalculationDetail,
        closeCalculationDetail,
        createBazar,
        updateBazar,
        toggleBazarStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        createClient,
        updateClient,
        executePurchase,
        executePayment,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
