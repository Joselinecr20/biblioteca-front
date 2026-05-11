import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { PrestamoService } from '../../../core/services/prestamo.service';
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
    private alertCtrl:       AlertController,
    private toastCtrl:       ToastController,
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
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar préstamos', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  async registrarDevolucion(p: Prestamo) {
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Registrar Devolución',
      subHeader: p.tituloLibro ?? `Préstamo #${p.idPrestamo}`,
      message:   '¿Confirmar la devolución de este libro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          cssClass: 'alert-confirm',
          handler: () => {
            this.prestamoService.devolver(p.idPrestamo).subscribe({
              next: async (updated) => {
                const idx = this.prestamos.findIndex(x => x.idPrestamo === p.idPrestamo);
                if (idx !== -1) this.prestamos[idx] = updated;
                (await this.toastCtrl.create({
                  message: 'Devolución registrada', duration: 3000, color: 'success', position: 'top',
                })).present();
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al registrar la devolución', duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
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
