import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
} from '@ionic/angular/standalone';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ReservaService } from '../../../core/services/reserva.service';
import { SwalService }    from '../../../core/services/swal.service';
import { Reserva } from '../../../core/models';

@Component({
  selector: 'app-lista-reservas',
  templateUrl: './lista-reservas.page.html',
  styleUrls:  ['./lista-reservas.page.scss'],
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class ListaReservasPage implements OnInit {
  reservas: Reserva[] = [];
  loading   = true;

  constructor(
    private reservaService: ReservaService,
    private swal:           SwalService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.reservaService.getAll().subscribe({
      next: (data) => {
        this.reservas = data.sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());
        this.loading  = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
        this.swal.toast('Error al cargar reservas', 'error');
      },
    });
  }

  async aprobar(r: Reserva) {
    const detalle = r.diasPrestamo
      ? `<strong>${r.diasPrestamo} días solicitados</strong>`
      : '¿Aprobar esta reserva?';
    const html = `<p class="swal-subtitulo">${r.tituloLibro ?? `Reserva #${r.idReserva}`}</p><p>${detalle}</p>`;

    const { isConfirmed } = await this.swal.confirm('Aprobar Reserva', html, 'Aprobar');
    if (!isConfirmed) return;

    this.reservaService.aprobar(r.idReserva).subscribe({
      next: () => {
        r.estado = 'aprobada';
        this.swal.success('Reserva aprobada');
      },
      error: (err) => this.swal.error('No se pudo aprobar', err?.error?.message || 'Intenta nuevamente.'),
    });
  }

  async rechazar(r: Reserva) {
    const html = `<p class="swal-subtitulo">${r.tituloLibro ?? `Reserva #${r.idReserva}`}</p>
                  <p>¿Rechazar esta solicitud de reserva?</p>`;
    const { isConfirmed } = await this.swal.danger('Rechazar Reserva', html, 'Rechazar');
    if (!isConfirmed) return;

    this.reservaService.rechazar(r.idReserva).subscribe({
      next: () => {
        r.estado = 'rechazada';
        this.swal.success('Reserva rechazada');
      },
      error: (err) => this.swal.error('No se pudo rechazar', err?.error?.message || 'Intenta nuevamente.'),
    });
  }

  badgeClass(estado: string): string {
    const m: Record<string, string> = {
      pendiente: 'badge-pendiente', aprobada: 'badge-aprobada',
      rechazada: 'badge-rechazada', cancelada: 'badge-cancelada',
    };
    return m[estado] || '';
  }

  doRefresh(event: any) { this.cargar(event); }
}
