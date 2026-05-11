import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Multa } from '../models';

@Injectable({ providedIn: 'root' })
export class MultaService {
  private readonly API = `${environment.apiUrl}/multas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Multa[]> {
    return this.http.get<any>(this.API).pipe(map(r => r.data ?? r));
  }

  getMis(): Observable<Multa[]> {
    return this.http.get<any>(`${this.API}/mis`).pipe(map(r => r.data ?? r));
  }

  pagar(id: number): Observable<Multa> {
    return this.http.put<any>(`${this.API}/${id}/pagar`, {}).pipe(map(r => r.data ?? r));
  }
}
