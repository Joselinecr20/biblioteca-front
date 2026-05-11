import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioCreate } from '../models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly API = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Usuario[]> {
    return this.http.get<any>(this.API).pipe(
      map(r => {
        const list: any[] = r.data ?? r;
        return list.map(u => ({ ...u, idUsuario: u.idUsuario ?? u.id }));
      })
    );
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<any>(`${this.API}/${id}`).pipe(
      map(r => {
        const u: any = r.data ?? r;
        return { ...u, idUsuario: u.idUsuario ?? u.id };
      })
    );
  }

  create(usuario: UsuarioCreate): Observable<Usuario> {
    return this.http.post<any>(this.API, usuario).pipe(map(r => r.data ?? r));
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<any>(`${this.API}/${id}`, usuario).pipe(map(r => r.data ?? r));
  }
}
