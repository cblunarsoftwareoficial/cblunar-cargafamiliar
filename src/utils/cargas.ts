import { differenceInYears, parseISO } from 'date-fns';
import type { CargaFamiliar, TramoAsignacion } from '../types';

export function formatRut(value: string): string {
  const cleanRut = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (cleanRut.length === 0) return '';
  if (cleanRut.length <= 1) return cleanRut;
  
  let result = cleanRut.slice(-1);
  let body = cleanRut.slice(0, -1);
  
  let formattedBody = '';
  while (body.length > 3) {
    formattedBody = '.' + body.slice(-3) + formattedBody;
    body = body.slice(0, -3);
  }
  formattedBody = body + formattedBody;
  
  return formattedBody + '-' + result;
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast-notification px-6 py-3 font-bold';
  toast.style.transform = 'translateY(20px)';
  toast.style.opacity = '0';
  
  if (type === 'error') {
    toast.style.backgroundColor = 'var(--danger)';
    toast.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.5)';
  }
  
  toast.innerText = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
  }, 10);

  setTimeout(() => {
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export function validarRut(rutCompleto: string): boolean {
  if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto.replace(/\./g, ''))) return false;
  
  let valor = rutCompleto.replace(/\./g, '').replace('-', '');
  const cuerpo = valor.slice(0, -1);
  const dv = valor.slice(-1).toUpperCase();
  
  if (cuerpo.length < 7) return false;
  
  let suma = 0;
  let multiplo = 2;
  
  for (let i = 1; i <= cuerpo.length; i++) {
    const index = multiplo * parseInt(valor.charAt(cuerpo.length - i));
    suma = suma + index;
    if (multiplo < 7) multiplo = multiplo + 1;
    else multiplo = 2;
  }
  
  const dvEsperado = 11 - (suma % 11);
  let dvCalculado = dvEsperado.toString();
  if (dvEsperado === 11) dvCalculado = '0';
  else if (dvEsperado === 10) dvCalculado = 'K';
  
  return dvCalculado === dv;
}

// Valores referenciales (Actualizables anualmente según ley chilena)
export const TRAMOS_ACTUALES: TramoAsignacion[] = [
  { letra: 'A', monto: 20328, rentaMinima: 0, rentaMaxima: 539328 },
  { letra: 'B', monto: 12475, rentaMinima: 539328, rentaMaxima: 787746 },
  { letra: 'C', monto: 3942, rentaMinima: 787746, rentaMaxima: 1228614 },
  { letra: 'D', monto: 0, rentaMinima: 1228614, rentaMaxima: null },
];

export function calcularTramo(sueldo: number): TramoAsignacion {
  for (const tramo of TRAMOS_ACTUALES) {
    if (tramo.rentaMaxima === null) {
      if (sueldo > tramo.rentaMinima) return tramo;
    } else {
      if (sueldo > tramo.rentaMinima && sueldo <= tramo.rentaMaxima) return tramo;
    }
  }
  return TRAMOS_ACTUALES[3]; // Fallback to Tramo D
}

export interface EstadoCarga {
  vigente: boolean;
  motivoVencimiento?: string;
}

export function verificarVigenciaCarga(carga: CargaFamiliar): EstadoCarga {
  if (carga.tipo === 'conyuge') {
    return { vigente: true }; // Cónyuge no tiene límite de edad
  }

  const hoy = new Date();
  const fechaNac = parseISO(carga.fechaNacimiento);
  const edad = differenceInYears(hoy, fechaNac);

  if (carga.estudiando) {
    if (edad >= 27) {
      return { vigente: false, motivoVencimiento: 'Hijo estudiante alcanzó los 27 años' };
    }
    return { vigente: true };
  } else {
    if (edad >= 18) {
      return { vigente: false, motivoVencimiento: 'Hijo no estudiante alcanzó los 18 años' };
    }
    return { vigente: true };
  }
}

export interface ProgresoTramite {
  porcentaje: number;
  diasRestantes: number;
  fechaExpiracion: Date | null;
  indefinido: boolean;
}

export function calcularProgresoTramite(carga: CargaFamiliar): ProgresoTramite {
  if (carga.tipo === 'conyuge') {
    return { porcentaje: 100, diasRestantes: 0, fechaExpiracion: null, indefinido: true };
  }

  const hoy = new Date();
  const fechaInicio = parseISO(carga.fechaInicio);
  const fechaNac = parseISO(carga.fechaNacimiento);
  
  // Calcular fecha de expiración (cumple 18 o 27)
  const añosLimite = carga.estudiando ? 27 : 18;
  const fechaExpiracion = new Date(fechaNac);
  fechaExpiracion.setFullYear(fechaExpiracion.getFullYear() + añosLimite);

  // Si ya expiró
  if (hoy >= fechaExpiracion) {
    return { porcentaje: 100, diasRestantes: 0, fechaExpiracion, indefinido: false };
  }

  // Si aún no ha iniciado (caso raro)
  if (hoy <= fechaInicio) {
    const diasTotal = Math.ceil((fechaExpiracion.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    return { porcentaje: 0, diasRestantes: diasTotal, fechaExpiracion, indefinido: false };
  }

  const tiempoTotal = fechaExpiracion.getTime() - fechaInicio.getTime();
  const tiempoTranscurrido = hoy.getTime() - fechaInicio.getTime();
  const diasRestantes = Math.ceil((fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  
  const porcentaje = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));

  return {
    porcentaje: Math.round(porcentaje),
    diasRestantes,
    fechaExpiracion,
    indefinido: false
  };
}
