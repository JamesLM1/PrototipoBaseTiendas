import { HelpTopic } from '../types';

export const HELP_TOPICS: Record<string, HelpTopic> = {
  linea_credito: {
    id: 'linea_credito',
    titulo: 'Línea de Crédito Comercial',
    definicion:
      'Límite monetario máximo de endeudamiento autorizado de forma individual por el bazar para cada cliente. Bloquea nuevas compras al crédito cuando el saldo acumulado alcanza este umbral.',
    normativa: 'Resolución SBS N.º 8181-2012 / Políticas internas del establecimiento.',
    ejemplo: 'Rango permitido en MiBazarPE: S/ 50.00 a S/ 10,000.00.',
  },
  tea: {
    id: 'tea',
    titulo: 'Tasa Efectiva Anual (TEA Compensatoria)',
    definicion:
      'Parámetro matemático que refleja el costo financiero real de la operación de financiamiento considerando la reinversión y capitalización de intereses en un año comercial de 360 días.',
    normativa: 'Ley N.º 26702, Art. 9; Código Civil, Art. 1242.',
    formula: 'TED = (1 + TEA)^(1/360) - 1   |   TEM = (1 + TEA)^(30/360) - 1',
    ejemplo: 'TEA 24.0000000% genera TED = 0.0598858% y TEM = 1.8087582%.',
  },
  tna: {
    id: 'tna',
    titulo: 'Tasa Nominal Anual (TNA) y Capitalización',
    definicion:
      'Expresión porcentual pactada para un período que no contempla la capitalización interna directa de intereses. Por tanto, exige especificar expresamente su frecuencia de capitalización para transformarse en TEA.',
    normativa: 'Doctrina de Matemática Financiera (Valera Moreno, 2012).',
    formula: 'TEA = (1 + TNA / m)^m - 1  (donde m es el número de capitalizaciones al año)',
    ejemplo: 'TNA 24% capitalizable mensualmente (m=12) equivale a TEA = 26.8241795%.',
  },
  capitalizacion: {
    id: 'capitalizacion',
    titulo: 'Período de Capitalización',
    definicion:
      'Frecuencia con la que los intereses devengados se añaden al capital inicial para generar nuevos intereses. MiBazarPE soporta diaria (360), mensual (12), bimestral (6), trimestral (4), cuatrimestral (3), semestral (2) y anual (1).',
  },
  tasa_moratoria: {
    id: 'tasa_moratoria',
    titulo: 'Tasa Moratoria Anual',
    definicion:
      'Indemnización económica exigible al deudor exclusivamente por el retraso en el cumplimiento de su obligación a partir del día posterior a la fecha pactada de pago, liquidada de forma separada.',
    normativa: 'Código Civil, Art. 1242; Resolución SBS N.º 8181-2012.',
    formula: 'Mora = DeudaVencida × ((1 + TED_mora)^días_atraso - 1)',
  },
  dia_corte: {
    id: 'dia_corte',
    titulo: 'Día y Hora de Corte Mensual',
    definicion:
      'Momento del ciclo mensual en el que se consolida la totalidad de las compras a crédito efectuadas hasta esa fecha y hora. Las operaciones posteriores a este corte pasan automáticamente al ciclo del mes siguiente.',
    normativa: 'Resolución SBS N.º 8181-2012.',
    ejemplo: 'Día 20 a las 20:00 hrs. Compras el 20 a las 20:30 pasan a la facturación siguiente.',
  },
  dia_pago: {
    id: 'dia_pago',
    titulo: 'Día de Pago Mensual (Fecha Límite)',
    definicion:
      'Fecha máxima establecida para extinguir la obligación líquida sin incurrir en mora. Debe ser posterior al día de corte en al menos 5 días para permitir la revisión del estado de cuenta.',
  },
  fin_de_mes: {
    id: 'fin_de_mes',
    titulo: 'Modalidad de Pago a Fin de Mes (Pago Único)',
    definicion:
      'Las compras realizadas antes del corte se agrupan en un estado de cuenta único. Se calculan intereses compensatorios por los días transcurridos desde cada compra hasta la fecha de pago pactada. Requiere pago total.',
    normativa: 'Ley N.º 26702, Art. 9; Res. SBS N.º 8181-2012.',
  },
  cuotas_frances: {
    id: 'cuotas_frances',
    titulo: 'Método Francés Vencido Simple Ordinario',
    definicion:
      'Sistema de amortización con cuotas mensuales uniformes (fijas). Si transcurren días entre la compra y el primer corte, se aplica período de gracia total capitalizando los intereses iniciales antes de estructurar las cuotas.',
    formula: 'C = P\' × [TEM × (1 + TEM)^n] / [(1 + TEM)^n - 1]',
    normativa: 'Senmache Sarmiento (2012); Aliaga Valdez & Aliaga Calderón (2022).',
  },
  prelacion_pagos: {
    id: 'prelacion_pagos',
    titulo: 'Orden de Prelación de Pagos',
    definicion:
      'Regla obligatoria de imputación de pagos. Todo abono se destina en estricto orden a: 1.º Intereses moratorios, 2.º Intereses compensatorios ordinarios, 3.º Capital principal.',
    normativa: 'Anexo obligatorio de Finanzas / Código Civil peruano.',
  },
  no_pagos_parciales: {
    id: 'no_pagos_parciales',
    titulo: 'Prohibición de Pagos Parciales en Fin de Mes',
    definicion:
      'En la modalidad de cuenta corriente a fin de mes, la liquidación debe abonarse en su totalidad líquida exigible. MiBazarPE no admite pagos parciales para evitar descuadres contables y saldos no amortizados.',
  },
  base_comercial_360: {
    id: 'base_comercial_360',
    titulo: 'Año Comercial de 360 Días',
    definicion:
      'Convención financiera peruana que asume el año con 360 días y los meses uniformes de 30 días, facilitando la equivalencia y el prorrateo de tasas en operaciones comerciales de corto y mediano plazo.',
    normativa: 'Ley N.º 26702, Ley General del Sistema Financiero, Art. 9.',
  },
  ley_29733: {
    id: 'ley_29733',
    titulo: 'Protección de Datos Personales (Ley N.º 29733)',
    definicion:
      'Obliga al consentimiento libre, previo, expreso e informado de los clientes y dueños de bazar para el tratamiento de su información personal, crediticia y comercial.',
  },
};
