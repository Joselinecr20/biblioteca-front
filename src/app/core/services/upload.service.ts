import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  subirFotoUsuario(idUsuario: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('imagen', file);
    return this.http.post(`${this.API}/upload/usuario/${idUsuario}`, fd);
  }

  subirPortadaLibro(idLibro: number, file: File): Observable<any> {
    const fd = new FormData();
    fd.append('imagen', file);
    return this.http.post(`${this.API}/upload/libro/${idLibro}`, fd);
  }

  /** Obtiene la foto del usuario como blob URL (lleva JWT automáticamente) */
  getFotoUsuario(id: number): Observable<string> {
    if (id <= 0) return of('');
    return this.http
      .get(`${this.API}/upload/usuario/${id}/imagen`, { responseType: 'blob' })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        catchError(() => of(''))
      );
  }

  /** Obtiene la portada del libro como blob URL (lleva JWT automáticamente) */
  getPortadaLibro(id: number): Observable<string> {
    if (id <= 0) return of('');
    return this.http
      .get(`${this.API}/upload/libro/${id}/imagen`, { responseType: 'blob' })
      .pipe(
        map(blob => URL.createObjectURL(blob)),
        catchError(() => of(''))
      );
  }

  /** URL directa (sin auth). Usar solo como fallback si los endpoints son públicos. */
  getUrlFotoUsuario(id: number): string {
    return id > 0 ? `${this.API}/upload/usuario/${id}/imagen` : '';
  }

  getUrlPortadaLibro(id: number): string {
    return id > 0 ? `${this.API}/upload/libro/${id}/imagen` : '';
  }
}
