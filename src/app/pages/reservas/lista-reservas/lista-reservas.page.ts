import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { ReservaService } from '../../../core/services/reserva.service';
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
    private alertCtrl:      AlertController,
    private toastCtrl:      ToastController,
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
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar reservas', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  async aprobar(r: Reserva) {
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Aprobar Reserva',
      subHeader: r.tituloLibro ?? `Reserva #${r.idReserva}`,
      message:   r.diasPrestamo ? `Plazo solicitado: ${r.diasPrestamo} días` : '¿Aprobar esta reserva?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aprobar',
          cssClass: 'alert-confirm',
          handler: () => {
            this.reservaService.aprobar(r.idReserva).subscribe({
              next: async () => {
                r.estado = 'aprobada';
                (await this.toastCtrl.create({
                  message: 'Reserva aprobada', duration: 3000, color: 'success', position: 'top',
                })).present();
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al aprobar la reserva', duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async rechazar(r: Reserva) {
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Rechazar Reserva',
      subHeader: r.tituloLibro ?? `Reserva #${r.idReserva}`,
      message:   '¿Rechazar esta solicitud de reserva?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Rechazar',
          cssClass: 'alert-danger',
          handler: () => {
            this.reservaService.rechazar(r.idReserva).subscribe({
              next: async () => {
                r.estado = 'rechazada';
                (await this.toastCtrl.create({
                  message: 'Reserva rechazada', duration: 3000, color: 'warning', position: 'top',
                })).present();
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al rechazar la reserva', duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
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
