import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MultaService } from '../../../core/services/multa.service';
import { Multa } from '../../../core/models';

@Component({
  selector: 'app-lista-multas',
  templateUrl: './lista-multas.page.html',
  styleUrls:  ['./lista-multas.page.scss'],
  standalone: true,
  imports: [
    DatePipe, CurrencyPipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class ListaMultasPage implements OnInit {
  multas:  Multa[] = [];
  loading  = true;

  constructor(
    private multaService: MultaService,
    private alertCtrl:   AlertController,
    private toastCtrl:   ToastController,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.multaService.getAll().subscribe({
      next: (data) => {
        this.multas  = data.sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime());
        this.loading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar multas', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  async registrarPago(m: Multa) {
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Registrar Pago',
      subHeader: `Monto: $${m.monto.toFixed(2)}`,
      message:   '¿Confirmar el pago de esta multa?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar Pago',
          cssClass: 'alert-confirm',
          handler: () => {
            this.multaService.pagar(m.idMulta).subscribe({
              next: async (updated) => {
                const idx = this.multas.findIndex(x => x.idMulta === m.idMulta);
                if (idx !== -1) this.multas[idx] = updated;
                (await this.toastCtrl.create({
                  message: 'Pago registrado exitosamente', duration: 3000, color: 'success', position: 'top',
                })).present();
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al registrar el pago', duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  doRefresh(event: any) { this.cargar(event); }
}
