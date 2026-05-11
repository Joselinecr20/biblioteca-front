import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<{ code: number; message: string; data: LoginResponse }>(
      `${this.API}/auth/login`, credentials
    ).pipe(
      map(res => res.data),
      tap(data => {
        localStorage.setItem('token',    data.token);
        localStorage.setItem('rol',      data.rol);
        localStorage.setItem('nombre',   data.nombre);
        localStorage.setItem('apellido', data.apellido);
        localStorage.setItem('usuario',  data.usuario);
        localStorage.setItem('idCuenta', String(data.idCuenta));
      })
    );
  }

  registro(data: any): Observable<any> {
    return this.http.post(`${this.API}/auth/registro`, data);
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string {
    return localStorage.getItem('rol') || '';
  }

  getNombre(): string {
    const nombre   = localStorage.getItem('nombre')   || '';
    const apellido = localStorage.getItem('apellido') || '';
    return `${nombre} ${apellido}`.trim();
  }

  getUsuario(): string {
    return localStorage.getItem('usuario') || '';
  }

  getIdCuenta(): number {
    return parseInt(localStorage.getItem('idCuenta') || '0', 10);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  redirectToDashboard(): void {
    const rol = this.getRol();
    if (rol === 'admin')           this.router.navigate(['/dashboard-admin']);
    else if (rol === 'bibliotecario') this.router.navigate(['/dashboard-bibliotecario']);
    else                           this.router.navigate(['/dashboard-estudiante']);
  }
}
