import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Libro } from '../models';

@Injectable({ providedIn: 'root' })
export class LibroService {
  private readonly API = `${environment.apiUrl}/libros`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Libro[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  getById(id: number): Observable<Libro> {
    return this.http.get<any>(`${this.API}/${id}`).pipe(map(r => r.data ?? r));
  }

  create(libro: Partial<Libro>): Observable<Libro> {
    return this.http.post<any>(this.API, libro).pipe(map(r => r.data ?? r));
  }

  update(id: number, libro: Partial<Libro>): Observable<Libro> {
    return this.http.put<any>(`${this.API}/${id}`, libro).pipe(map(r => r.data ?? r));
  }

  setStock(id: number, items: { idBiblioteca: number; cantidadTotal: number }[]): Observable<Libro> {
    return this.http.put<any>(`${this.API}/${id}/stock`, { items }).pipe(map(r => r.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
