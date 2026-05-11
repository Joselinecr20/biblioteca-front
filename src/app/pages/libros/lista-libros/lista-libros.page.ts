import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSearchbar, IonGrid, IonRow, IonCol,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonButton, IonIcon, IonFab, IonFabButton,
  IonSkeletonText, IonRefresher, IonRefresherContent,
  AlertController, ToastController,
} from '@ionic/angular/standalone';
import { LibroService }   from '../../../core/services/libro.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService }    from '../../../core/services/auth.service';
import { UploadService }  from '../../../core/services/upload.service';
import { Libro } from '../../../core/models';

@Component({
  selector: 'app-lista-libros',
  templateUrl: './lista-libros.page.html',
  styleUrls:  ['./lista-libros.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSearchbar, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
    IonBadge, IonButton, IonIcon, IonFab, IonFabButton,
    IonSkeletonText, IonRefresher, IonRefresherContent,
  ],
})
export class ListaLibrosPage implements OnInit, OnDestroy {
  libros:         Libro[] = [];
  filteredLibros: Libro[] = [];
  loading  = true;
  rol      = '';

  /** blob URL por idLibro */
  portadaUrls = new Map<number, string>();
  private blobsPortada: string[] = [];

  private libroParaPortada: Libro | null = null;

  @ViewChild('portadaInput') private portadaInput!: ElementRef<HTMLInputElement>;

  constructor(
    private libroService:   LibroService,
    private reservaService: ReservaService,
    private auth:           AuthService,
    private uploadService:  UploadService,
    private router:         Router,
    private alertCtrl:      AlertController,
    private toastCtrl:      ToastController,
  ) {}

  ngOnInit() {
    this.rol = this.auth.getRol();
    this.cargar();
  }

  ngOnDestroy() {
    this.blobsPortada.forEach(u => URL.revokeObjectURL(u));
  }

  cargar(event?: any) {
    this.loading = true;
    this.libroService.getAll().subscribe({
      next: (data) => {
        this.libros         = data;
        this.filteredLibros = data;
        this.loading        = false;
        event?.target?.complete();
        this.precargarPortadas(data);
      },
      error: async () => {
        this.loading = false;
        event?.target?.complete();
        this.toast('Error al cargar libros', 'danger');
      },
    });
  }

  private precargarPortadas(libros: Libro[]) {
    // Liberar blobs anteriores
    this.blobsPortada.forEach(u => URL.revokeObjectURL(u));
    this.blobsPortada = [];
    this.portadaUrls  = new Map();

    libros.forEach(libro => {
      this.uploadService.getPortadaLibro(libro.idLibro).subscribe(url => {
        if (url) {
          this.blobsPortada.push(url);
          this.portadaUrls = new Map(this.portadaUrls).set(libro.idLibro, url);
        }
      });
    });
  }

  buscar(event: any) {
    const term = event.detail.value?.toLowerCase() || '';
    this.filteredLibros = term
      ? this.libros.filter(l =>
          l.titulo.toLowerCase().includes(term) ||
          l.editorial?.toLowerCase().includes(term))
      : [...this.libros];
  }

  abrirPickerPortada(event: Event, libro: Libro) {
    event.stopPropagation();
    this.libroParaPortada = libro;
    this.portadaInput.nativeElement.value = '';
    this.portadaInput.nativeElement.click();
  }

  async onPortadaSeleccionada(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.libroParaPortada) return;

    const libro = this.libroParaPortada;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      this.toast('Solo se permiten imágenes JPG, PNG o WebP', 'danger');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.toast('La imagen no debe superar los 5 MB', 'danger');
      return;
    }

    this.uploadService.subirPortadaLibro(libro.idLibro, file).subscribe({
      next: () => {
        // Recargar blob de ese libro
        this.uploadService.getPortadaLibro(libro.idLibro).subscribe(url => {
          if (url) {
            this.blobsPortada.push(url);
            this.portadaUrls = new Map(this.portadaUrls).set(libro.idLibro, url);
          }
        });
        this.toast('Portada actualizada', 'success');
      },
      error: () => this.toast('Error al subir la portada', 'danger'),
    });
  }

  async reservar(libro: Libro) {
    const alert = await this.alertCtrl.create({
      cssClass: 'biblioteca-alert',
      header:    'Reservar Libro',
      subHeader: libro.titulo,
      message:   '¿Cuántos días necesitas el libro?',
      inputs: [
        { type: 'radio', label: '3 días',  value: 3,  checked: true },
        { type: 'radio', label: '7 días',  value: 7 },
        { type: 'radio', label: '14 días', value: 14 },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Reservar',
          cssClass: 'alert-confirm',
          handler: (diasPrestamo: number) => {
            this.reservaService.create({ idLibro: libro.idLibro, idBiblioteca: 1, diasPrestamo }).subscribe({
              next: () => this.toast('Reserva realizada con éxito', 'success'),
              error: (err) => this.toast(err?.error?.message || 'Error al crear la reserva', 'danger'),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async eliminar(libro: Libro) {
    const alert = await this.alertCtrl.create({
      cssClass:  'biblioteca-alert',
      header:    'Eliminar Libro',
      subHeader: libro.titulo,
      message:   'Esta acción es permanente y no se puede deshacer.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'alert-danger',
          handler: () => {
            this.libroService.delete(libro.idLibro).subscribe({
              next: () => {
                this.libros         = this.libros.filter(l => l.idLibro !== libro.idLibro);
                this.filteredLibros = this.filteredLibros.filter(l => l.idLibro !== libro.idLibro);
                this.toast('Libro eliminado', 'success');
              },
              error: () => this.toast('Error al eliminar el libro', 'danger'),
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string, color: string) {
    (await this.toastCtrl.create({ message, duration: 3000, color, position: 'top' })).present();
  }

  doRefresh(event: any) { this.cargar(event); }

  esAdminOBibliotecario() { return ['admin', 'bibliotecario'].includes(this.rol); }
  esEstudiante()          { return this.rol === 'estudiante'; }
}
