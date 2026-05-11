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
import { LibroService }   from '../../core/services/libro.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { PrestamoService } from '../../core/services/prestamo.service';
import { MultaService }   from '../../core/services/multa.service';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls:  ['./dashboard-admin.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonGrid, IonRow, IonCol, IonCard, IonCardContent,
    IonIcon, IonButton, IonSkeletonText, IonRefresher, IonRefresherContent,
  ],
})
export class DashboardAdminPage implements OnInit {
  nombre  = '';
  loading = true;
  stats   = { libros: 0, usuarios: 0, prestamosActivos: 0, multasPendientes: 0 };

  constructor(
    private auth:      AuthService,
    private libros:    LibroService,
    private usuarios:  UsuarioService,
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
      libros:    this.libros.getAll(),
      usuarios:  this.usuarios.getAll(),
      prestamos: this.prestamos.getAll(),
      multas:    this.multas.getAll(),
    }).subscribe({
      next: (d) => {
        this.stats.libros           = d.libros.length;
        this.stats.usuarios         = d.usuarios.length;
        this.stats.prestamosActivos = d.prestamos.filter(p => p.estado === 'activo').length;
        this.stats.multasPendientes = d.multas.filter(m => m.estado === 'pendiente').length;
        this.loading = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar estadísticas', duration: 3000,
          color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  doRefresh(event: any) { this.cargarStats(event); }
}
