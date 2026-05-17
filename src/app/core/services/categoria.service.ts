import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CategoriaItem {
  idCategoria: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly API = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CategoriaItem[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  create(nombre: string): Observable<CategoriaItem> {
    return this.http.post<any>(this.API, { nombre }).pipe(map(r => r.data ?? r));
  }

  update(id: number, nombre: string): Observable<CategoriaItem> {
    return this.http.put<any>(`${this.API}/${id}`, { nombre }).pipe(map(r => r.data ?? r));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
