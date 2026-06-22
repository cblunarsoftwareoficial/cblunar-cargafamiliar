export interface Empresa {
  id: string;
  rut: string;
  razonSocial: string;
  telefono?: string;
  email?: string;
}

export interface Trabajador {
  id: string;
  empresaId: string;
  rut: string;
  nombre: string;
  sueldoBase: number;
  telefono?: string;
  cargo?: string;
}

export interface CargaFamiliar {
  id: string;
  trabajadorId: string;
  rutCausante: string;
  nombre: string;
  tipo: 'conyuge' | 'hijo';
  fechaNacimiento: string; // ISO date string YYYY-MM-DD
  estudiando: boolean;
  fechaInicio: string; // ISO date string
  numeroResolucion: string;
  fechaResolucion: string; // ISO date string
}

export interface TramoAsignacion {
  letra: 'A' | 'B' | 'C' | 'D';
  monto: number;
  rentaMinima: number;
  rentaMaxima: number | null; // null means no limit
}
