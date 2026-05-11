import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonAvatar,
  IonBadge, IonButton, IonIcon, IonFab, IonFabButton,
  IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote, IonSearchbar,
  ToastController,
} from '@ionic/angular/standalone';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/models';

@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.page.html',
  styleUrls:  ['./lista-usuarios.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonAvatar,
    IonBadge, IonButton, IonIcon, IonFab, IonFabButton,
    IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote, IonSearchbar,
  ],
})
export class ListaUsuariosPage implements OnInit {
  usuarios:  Usuario[] = [];
  filtered:  Usuario[] = [];
  loading = true;

  constructor(
    private usuarioService: UsuarioService,
    private toastCtrl:      ToastController,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.usuarioService.getAll().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.filtered = data;
        this.loading  = false;
        event?.target?.complete();
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        (await this.toastCtrl.create({
          message: 'Error al cargar usuarios', duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  buscar(event: any) {
    const term = event.detail.value?.toLowerCase() || '';
    this.filtered = term
      ? this.usuarios.filter(u =>
          u.nombre.toLowerCase().includes(term) ||
          u.apellido.toLowerCase().includes(term) ||
          u.correo.toLowerCase().includes(term))
      : [...this.usuarios];
  }

  iniciales(u: Usuario): string {
    return `${u.nombre.charAt(0)}${u.apellido.charAt(0)}`.toUpperCase();
  }

  doRefresh(event: any) { this.cargar(event); }
}
