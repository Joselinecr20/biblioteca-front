import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Prestamo } from '../models';

@Injectable({ providedIn: 'root' })
export class PrestamoService {
  private readonly API = `${environment.apiUrl}/prestamos`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Prestamo[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  getMis(): Observable<Prestamo[]> {
    return this.http.get<any>(`${this.API}/mis`).pipe(map(r => r.data ?? r));
  }

  devolver(id: number): Observable<Prestamo> {
    const hoy = new Date().toISOString().split('T')[0];
    return this.http.post<any>(`${this.API}/${id}/devolver`, { fechaDevolucionReal: hoy })
      .pipe(map(r => r.data ?? r));
  }
}
