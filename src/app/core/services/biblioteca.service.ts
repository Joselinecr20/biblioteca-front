import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface BibliotecaItem {
  idBiblioteca: number;
  nombre: string;
  ubicacion?: string;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaService {
  private readonly API = `${environment.apiUrl}/bibliotecas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BibliotecaItem[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  create(nombre: string, ubicacion: string): Observable<BibliotecaItem> {
    return this.http.post<any>(this.API, { nombre, ubicacion }).pipe(map(r => r.data ?? r));
  }

  update(id: number, nombre: string, ubicacion: string): Observable<BibliotecaItem> {
    return this.http.put<any>(`${this.API}/${id}`, { nombre, ubicacion }).pipe(map(r => r.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
