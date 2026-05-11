import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
  IonIcon, IonButton, IonSkeletonText, IonRefresher, IonRefresherContent,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService }    from '../../core/services/auth.service';
import { ReservaService } from '../../core/services/reserva.service';
import { PrestamoService } from '../../core/services/prestamo.service';
import { MultaService }   from '../../core/services/multa.service';

@Component({
  selector: 'app-dashboard-bibliotecario',
  templateUrl: './dashboard-bibliotecario.page.html',
  styleUrls:  ['./dashboard-bibliotecario.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonIcon, IonButton, IonSkeletonText, IonRefresher, IonRefresherContent,
  ],
})
export class DashboardBibliotecarioPage implements OnInit {
  nombre  = '';
  loading = true;
  stats   = { prestamosActivos: 0, reservasPendientes: 0, multasPendientes: 0 };

  constructor(
    private auth:      AuthService,
    private reservas:  ReservaService,
    private prestamos: PrestamoService,
    private multas:    MultaService,
    private toastCtrl: ToastController,
  ) {}

  ngOnInit() {
    this.nombre = this.auth.getNombre();
    this.cargarStats();
  }

  cargarStats(event?: any) {
    this.loading = true;
    forkJoin({
      reservas:  this.reservas.getAll(),
      prestamos: this.prestamos.getAll(),
      multas:    this.multas.getAll(),
    }).subscribe({
      next: (d) => {
        this.stats.prestamosActivos  = d.prestamos.filter(p => p.estado === 'activo').length;
        this.stats.reservasPendientes = d.reservas.filter(r => r.estado === 'pendiente').length;
        this.stats.multasPendientes  = d.multas.filter(m => m.estado === 'pendiente').length;
        this.loading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar datos', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  doRefresh(event: any) { this.cargarStats(event); }
}
