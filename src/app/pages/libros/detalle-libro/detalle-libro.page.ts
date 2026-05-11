import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonCard, IonCardContent, IonBadge,
  IonButton, IonIcon, IonSkeletonText,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { LibroService }   from '../../../core/services/libro.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService }    from '../../../core/services/auth.service';
import { UploadService }  from '../../../core/services/upload.service';
import { ImagePickerComponent } from '../../../shared/components/image-picker/image-picker.component';
import { Libro } from '../../../core/models';

@Component({
  selector: 'app-detalle-libro',
  templateUrl: './detalle-libro.page.html',
  styleUrls:  ['./detalle-libro.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonCard, IonCardContent, IonBadge,
    IonButton, IonIcon, IonSkeletonText,
    ImagePickerComponent,
  ],
})
export class DetalleLibroPage implements OnInit {
  libro:       Libro | null = null;
  loading      = true;
  rol          = '';
  portadaUrl   = '';
  private blobPortada = '';

  constructor(
    private route:          ActivatedRoute,
    private router:         Router,
    private libroService:   LibroService,
    private reservaService: ReservaService,
    private auth:           AuthService,
    public  uploadService:  UploadService,
    private alertCtrl:      AlertController,
    private toastCtrl:      ToastController,
  ) {}

  ngOnInit() {
    this.rol = this.auth.getRol();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.libroService.getById(id).subscribe({
      next:  (l)  => {
        this.libro   = l;
        this.loading = false;
        this.cargarPortada(l.idLibro);
      },
      error: async () => {
        this.loading = false;
        (await this.toastCtrl.create({
          message: 'Error al cargar el libro', duration: 3000, color: 'danger', position: 'top',
        })).present();
        this.router.navigate(['/libros']);
      },
    });
  }

  async reservar() {
    if (!this.libro) return;
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Reservar Libro',
      subHeader: this.libro.titulo,
      message: '¿Cuántos días necesitas el libro?',
      inputs: [
        { type: 'radio', label: '3 días',  value: 3,  checked: true },
        { type: 'radio', label: '7 días',  value: 7 },
        { type: 'radio', label: '14 días', value: 14 },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reservar',
          handler: (diasPrestamo: number) => {
            this.reservaService.create({
              idLibro: this.libro!.idLibro,
              idBiblioteca: 1,
              diasPrestamo,
            }).subscribe({
              next: async () => {
                (await this.toastCtrl.create({
                  message: `Reserva creada por ${diasPrestamo} días`, duration: 3000, color: 'success', position: 'top',
                })).present();
                this.router.navigate(['/reservas/mis']);
              },
              error: async (err) => {
                (await this.toastCtrl.create({
                  message: err?.error?.message || 'Error al crear reserva',
                  duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async eliminar() {
    if (!this.libro) return;
    const alert = await this.alertCtrl.create({
      cssClass: 'biblioteca-alert',
      header:   'Eliminar Libro',
      message:  'Esta acción es permanente y no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-danger',
          handler: () => {
            this.libroService.delete(this.libro!.idLibro).subscribe({
              next: async () => {
                (await this.toastCtrl.create({
                  message: 'Libro eliminado', duration: 3000, color: 'success', position: 'top',
                })).present();
                this.router.navigate(['/libros']);
              },
              error: async () => {
                (await this.toastCtrl.create({
                  message: 'Error al eliminar el libro',
                  duration: 3000, color: 'danger', position: 'top',
                })).present();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  cargarPortada(idLibro: number) {
    this.uploadService.getPortadaLibro(idLibro).subscribe(url => {
      if (this.blobPortada) URL.revokeObjectURL(this.blobPortada);
      this.blobPortada = url;
      this.portadaUrl  = url;
    });
  }

  onPortadaCambiada() {
    if (this.libro) this.cargarPortada(this.libro.idLibro);
  }

  esAdminOBibliotecario() { return ['admin', 'bibliotecario'].includes(this.rol); }
  esEstudiante()          { return this.rol === 'estudiante'; }
}
