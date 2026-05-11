export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  idCuenta: number;
  usuario: string;
  rol: string;
  nombre: string;
  apellido: string;
}

export interface Libro {
  idLibro: number;
  titulo: string;
  editorial: string;
  anioPublicacion: number;
  descripcion: string;
  portadaUrl: string;
  isbn: string;
  idCategoria: number;
  disponible?: boolean;
}

export interface Usuario {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fotoUrl: string;
  activo: boolean;
  rol?: string;
}

export interface UsuarioCreate {
  usuario: string;
  password: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  rol: string;
}

export interface Reserva {
  idReserva: number;
  idUsuario: number;
  idLibro: number;
  idBiblioteca: number;
  fechaReserva: string;
  fechaExpiracion: string;
  estado: string;
  observaciones: string;
  diasPrestamo?: number;
  nombreUsuario?: string;
  tituloLibro?: string;
}

export interface Prestamo {
  idPrestamo: number;
  idUsuario: number;
  idLibro: number;
  fechaPrestamo: string;
  fechaDevolucion: string;
  fechaDevolucionReal: string;
  estado: string;
  nombreUsuario?: string;
  tituloLibro?: string;
}

export interface Multa {
  idMulta: number;
  idPrestamo: number;
  monto: number;
  diasRetraso: number;
  estado: string;
  fechaGeneracion: string;
  fechaPago: string;
  nombreUsuario?: string;
}
