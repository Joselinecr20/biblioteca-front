import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Reserva } from '../models';

@Injectable({ providedIn: 'root' })
export class ReservaService {
  private readonly API = `${environment.apiUrl}/reservas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Reserva[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  getMis(): Observable<Reserva[]> {
    return this.http.get<any>(`${this.API}/mis`).pipe(map(r => r.data ?? r));
  }

  create(reserva: Partial<Reserva>): Observable<Reserva> {
    return this.http.post<any>(this.API, reserva).pipe(map(r => r.data ?? r));
  }

  aprobar(id: number): Observable<Reserva> {
    return this.http.put<any>(`${this.API}/${id}/aprobar`, {}).pipe(map(r => r.data ?? r));
  }

  rechazar(id: number): Observable<Reserva> {
    return this.http.put<any>(`${this.API}/${id}/rechazar`, {}).pipe(map(r => r.data ?? r));
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
