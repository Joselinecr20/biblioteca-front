import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { PrestamoService } from '../../../core/services/prestamo.service';
import { SwalService }     from '../../../core/services/swal.service';
import { Prestamo } from '../../../core/models';

@Component({
  selector: 'app-lista-prestamos',
  templateUrl: './lista-prestamos.page.html',
  styleUrls:  ['./lista-prestamos.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class ListaPrestamosPage implements OnInit {
  prestamos: Prestamo[] = [];
  loading    = true;

  constructor(
    private prestamoService: PrestamoService,
    private swal:            SwalService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.prestamoService.getAll().subscribe({
      next: (data) => {
        this.prestamos = data.sort((a, b) => new Date(b.fechaPrestamo).getTime() - new Date(a.fechaPrestamo).getTime());
        this.loading   = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
        this.swal.toast('Error al cargar préstamos', 'error');
      },
    });
  }

  async registrarDevolucion(p: Prestamo) {
    const html = `<p class="swal-subtitulo">${p.tituloLibro ?? `Préstamo #${p.idPrestamo}`}</p>
                  <p>¿Confirmar la devolución de este libro?</p>`;
    const { isConfirmed } = await this.swal.confirm('Registrar Devolución', html, 'Confirmar');
    if (!isConfirmed) return;

    this.prestamoService.devolver(p.idPrestamo).subscribe({
      next: (updated) => {
        const idx = this.prestamos.findIndex(x => x.idPrestamo === p.idPrestamo);
        if (idx !== -1) this.prestamos[idx] = updated;
        this.swal.success('Devolución registrada');
      },
      error: (err) => this.swal.error('Error al registrar', err?.error?.message || 'No se pudo registrar la devolución.'),
    });
  }

  estaRetrasado(p: Prestamo): boolean {
    if (p.estado !== 'activo') return false;
    return new Date() > new Date(p.fechaDevolucion);
  }

  badgeClass(p: Prestamo): string {
    if (p.estado === 'devuelto') return 'badge-devuelto';
    if (this.estaRetrasado(p))   return 'badge-retrasado';
    return 'badge-activo';
  }

  badgeLabel(p: Prestamo): string {
    if (p.estado === 'devuelto')  return 'Devuelto';
    if (this.estaRetrasado(p))   return 'Retrasado';
    return 'Activo';
  }

  doRefresh(event: any) { this.cargar(event); }
}
