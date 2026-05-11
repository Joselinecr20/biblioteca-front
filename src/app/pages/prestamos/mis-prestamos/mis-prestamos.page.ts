import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote, IonCard, IonCardContent,
  ToastController,
} from '@ionic/angular/standalone';
import { DatePipe } from '@angular/common';
import { PrestamoService } from '../../../core/services/prestamo.service';
import { Prestamo } from '../../../core/models';

@Component({
  selector: 'app-mis-prestamos',
  templateUrl: './mis-prestamos.page.html',
  styleUrls:  ['./mis-prestamos.page.scss'],
  standalone: true,
  imports: [
    DatePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote, IonCard, IonCardContent,
  ],
})
export class MisPrestamosPage implements OnInit {
  prestamos: Prestamo[] = [];
  loading    = true;

  constructor(
    private prestamoService: PrestamoService,
    private toastCtrl:       ToastController,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.prestamoService.getMis().subscribe({
      next: (data) => {
        this.prestamos = data.sort((a, b) => new Date(b.fechaPrestamo).getTime() - new Date(a.fechaPrestamo).getTime());
        this.loading   = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar tus préstamos', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  diasRestantes(fecha: string): number {
    const diff = new Date(fecha).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  estaRetrasado(p: Prestamo): boolean {
    return p.estado === 'activo' && this.diasRestantes(p.fechaDevolucion) < 0;
  }

  estaPorVencer(p: Prestamo): boolean {
    const dias = this.diasRestantes(p.fechaDevolucion);
    return p.estado === 'activo' && dias >= 0 && dias <= 3;
  }

  badgeClass(p: Prestamo): string {
    if (p.estado === 'devuelto')  return 'badge-devuelto';
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
