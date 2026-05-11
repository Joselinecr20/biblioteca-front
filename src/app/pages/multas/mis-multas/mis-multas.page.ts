import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
  ToastController,
} from '@ionic/angular/standalone';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MultaService } from '../../../core/services/multa.service';
import { Multa } from '../../../core/models';

@Component({
  selector: 'app-mis-multas',
  templateUrl: './mis-multas.page.html',
  styleUrls:  ['./mis-multas.page.scss'],
  standalone: true,
  imports: [
    DatePipe, CurrencyPipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class MisMultasPage implements OnInit {
  multas:  Multa[] = [];
  loading  = true;
  totalPendiente = 0;

  constructor(
    private multaService: MultaService,
    private toastCtrl:   ToastController,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.multaService.getMis().subscribe({
      next: (data) => {
        this.multas  = data;
        this.totalPendiente = data
          .filter(m => m.estado === 'pendiente')
          .reduce((sum, m) => sum + m.monto, 0);
        this.loading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar tus multas', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  doRefresh(event: any) { this.cargar(event); }
}
