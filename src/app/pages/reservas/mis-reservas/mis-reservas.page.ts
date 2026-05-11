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
    private alertCtrl:      AlertController,
    private toastCtrl:      ToastController,
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
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar tus reservas', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  async cancelar(r: Reserva) {
    const alert = await this.alertCtrl.create({
      cssClass: 'biblioteca-alert',
      header:   'Cancelar Reserva',
      message:  '¿Desea cancelar esta reserva?',
      buttons: [
        { text: 'No', role: 'cancel' },
        {
          text: 'Sí, cancelar',
          cssClass: 'alert-danger',
          handler: () => {
            this.reservaService.cancelar(r.idReserva).subscribe({
              next: async () => {
                this.reservas = this.reservas.filter(x => x.idReserva !== r.idReserva);
                (await this.toastCtrl.create({
                  message: 'Reserva cancelada', duration: 3000, color: 'success', position: 'top',
                })).present();
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al cancelar la reserva', duration: 3000, color: 'danger', position: 'top',
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
