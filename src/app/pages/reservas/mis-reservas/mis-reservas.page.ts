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
  selector: 'app-mis-reservas',
  templateUrl: './mis-reservas.page.html',
  styleUrls:  ['./mis-reservas.page.scss'],
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class MisReservasPage implements OnInit {
  reservas: Reserva[] = [];
  loading   = true;

  constructor(
    private reservaService: ReservaService,
    private swal:           SwalService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.reservaService.getMis().subscribe({
      next: (data) => {
        this.reservas = data.sort((a, b) => new Date(b.fechaReserva).getTime() - new Date(a.fechaReserva).getTime());
        this.loading  = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
        this.swal.toast('Error al cargar sus reservas', 'error');
      },
    });
  }

  async cancelar(r: Reserva) {
    const html = `<p class="swal-subtitulo">${r.tituloLibro ?? `Reserva #${r.idReserva}`}</p>
                  <p>¿Desea cancelar esta reserva?</p>`;
    const { isConfirmed } = await this.swal.danger('Cancelar Reserva', html, 'Sí, cancelar');
    if (!isConfirmed) return;

    this.reservaService.cancelar(r.idReserva).subscribe({
      next: () => {
        this.reservas = this.reservas.filter(x => x.idReserva !== r.idReserva);
        this.swal.success('Reserva cancelada');
      },
      error: (err) => this.swal.error('No se pudo cancelar', err?.error?.message || 'Intente nuevamente.'),
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
