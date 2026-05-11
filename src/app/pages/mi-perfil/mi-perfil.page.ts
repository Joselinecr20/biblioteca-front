import { Component, OnInit } from '@angular/core';
import { UpperCasePipe, TitleCasePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonCard, IonCardContent, IonItem, IonLabel,
  IonIcon, IonNote, IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mailOutline, callOutline, shieldCheckmarkOutline, ellipseOutline } from 'ionicons/icons';
import { AuthService }    from '../../core/services/auth.service';
import { UsuarioService } from '../../core/services/usuario.service';
import { ImagePickerComponent } from '../../shared/components/image-picker/image-picker.component';
import { Usuario } from '../../core/models';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.page.html',
  styleUrls:  ['./mi-perfil.page.scss'],
  standalone: true,
  imports: [
    UpperCasePipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonCard, IonCardContent, IonItem, IonLabel,
    IonIcon, IonNote, IonSkeletonText,
    ImagePickerComponent,
  ],
})
export class MiPerfilPage implements OnInit {
  usuario:  Usuario | null = null;
  loading   = true;
  idCuenta  = 0;
  nombre    = '';
  rol       = '';

  constructor(
    private auth:           AuthService,
    private usuarioService: UsuarioService,
  ) {
    addIcons({ mailOutline, callOutline, shieldCheckmarkOutline, ellipseOutline });
  }

  ngOnInit() {
    this.nombre   = this.auth.getNombre();
    this.rol      = this.auth.getRol();
    this.idCuenta = this.auth.getIdCuenta();
    this.cargarPerfil();
  }

  cargarPerfil() {
    this.loading = true;
    this.usuarioService.getById(this.idCuenta).subscribe({
      next:  (u) => { this.usuario = u; this.loading = false; },
      error: ()  => { this.loading = false; },
    });
  }

  onFotoSubida() {
    // El picker ya actualiza la imagen automáticamente via cache-busting.
    // Llamamos update en el backend para registrar que existe una foto.
    this.usuarioService.update(this.idCuenta, {}).subscribe();
  }

  iniciales(): string {
    const parts = this.nombre.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : this.nombre.charAt(0).toUpperCase();
  }
}
