import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage),
  },

  // ---- DASHBOARDS ----
  {
    path: 'dashboard-admin',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin.page').then(m => m.DashboardAdminPage),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'dashboard-bibliotecario',
    loadComponent: () =>
      import('./pages/dashboard-bibliotecario/dashboard-bibliotecario.page').then(m => m.DashboardBibliotecarioPage),
    canActivate: [authGuard],
    data: { roles: ['bibliotecario'] },
  },
  {
    path: 'dashboard-estudiante',
    loadComponent: () =>
      import('./pages/dashboard-estudiante/dashboard-estudiante.page').then(m => m.DashboardEstudiantePage),
    canActivate: [authGuard],
    data: { roles: ['estudiante'] },
  },

  // ---- LIBROS ----
  {
    path: 'libros',
    loadComponent: () =>
      import('./pages/libros/lista-libros/lista-libros.page').then(m => m.ListaLibrosPage),
    canActivate: [authGuard],
  },
  {
    path: 'libros/nuevo',
    loadComponent: () =>
      import('./pages/libros/form-libro/form-libro.page').then(m => m.FormLibroPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'libros/:id/editar',
    loadComponent: () =>
      import('./pages/libros/form-libro/form-libro.page').then(m => m.FormLibroPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'libros/:id',
    loadComponent: () =>
      import('./pages/libros/detalle-libro/detalle-libro.page').then(m => m.DetalleLibroPage),
    canActivate: [authGuard],
  },

  // ---- USUARIOS ----
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/usuarios/lista-usuarios/lista-usuarios.page').then(m => m.ListaUsuariosPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () =>
      import('./pages/usuarios/form-usuario/form-usuario.page').then(m => m.FormUsuarioPage),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'usuarios/:id/editar',
    loadComponent: () =>
      import('./pages/usuarios/form-usuario/form-usuario.page').then(m => m.FormUsuarioPage),
    canActivate: [authGuard],
    data: { roles: ['admin'] },
  },

  // ---- RESERVAS ----
  {
    path: 'reservas',
    loadComponent: () =>
      import('./pages/reservas/lista-reservas/lista-reservas.page').then(m => m.ListaReservasPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'reservas/mis',
    loadComponent: () =>
      import('./pages/reservas/mis-reservas/mis-reservas.page').then(m => m.MisReservasPage),
    canActivate: [authGuard],
    data: { roles: ['estudiante'] },
  },

  // ---- PRÉSTAMOS ----
  {
    path: 'prestamos',
    loadComponent: () =>
      import('./pages/prestamos/lista-prestamos/lista-prestamos.page').then(m => m.ListaPrestamosPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'prestamos/mis',
    loadComponent: () =>
      import('./pages/prestamos/mis-prestamos/mis-prestamos.page').then(m => m.MisPrestamosPage),
    canActivate: [authGuard],
    data: { roles: ['estudiante'] },
  },

  // ---- MI PERFIL ----
  {
    path: 'mi-perfil',
    loadComponent: () =>
      import('./pages/mi-perfil/mi-perfil.page').then(m => m.MiPerfilPage),
    canActivate: [authGuard],
  },

  // ---- MULTAS ----
  {
    path: 'multas',
    loadComponent: () =>
      import('./pages/multas/lista-multas/lista-multas.page').then(m => m.ListaMultasPage),
    canActivate: [authGuard],
    data: { roles: ['admin', 'bibliotecario'] },
  },
  {
    path: 'multas/mis',
    loadComponent: () =>
      import('./pages/multas/mis-multas/mis-multas.page').then(m => m.MisMultasPage),
    canActivate: [authGuard],
    data: { roles: ['estudiante'] },
  },
];
