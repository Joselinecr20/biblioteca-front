import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSearchbar, IonGrid, IonRow, IonCol,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonBadge, IonButton, IonIcon, IonFab, IonFabButton,
  IonSkeletonText, IonRefresher, IonRefresherContent,
} from '@ionic/angular/standalone';
import { LibroService }   from '../../../core/services/libro.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService }    from '../../../core/services/auth.service';
import { UploadService }  from '../../../core/services/upload.service';
import { SwalService }    from '../../../core/services/swal.service';
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
    private swal:           SwalService,
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
      error: () => {
        this.loading = false;
        event?.target?.complete();
        this.swal.toast('Error al cargar libros', 'error');
      },
    });
  }

  private precargarPortadas(libros: Libro[]) {
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
      this.swal.toast('Solo se permiten imágenes JPG, PNG o WebP', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.swal.toast('La imagen no debe superar los 5 MB', 'error');
      return;
    }

    this.uploadService.subirPortadaLibro(libro.idLibro, file).subscribe({
      next: () => {
        this.uploadService.getPortadaLibro(libro.idLibro).subscribe(url => {
          if (url) {
            this.blobsPortada.push(url);
            this.portadaUrls = new Map(this.portadaUrls).set(libro.idLibro, url);
          }
        });
        this.swal.toast('Portada actualizada', 'success');
      },
      error: () => this.swal.toast('Error al subir la portada', 'error'),
    });
  }

  async reservar(libro: Libro) {
    const diasPrestamo = await this.swal.selectDias(libro.titulo);
    if (!diasPrestamo) return;

    this.reservaService.create({ idLibro: libro.idLibro, idBiblioteca: 1, diasPrestamo }).subscribe({
      next: () => this.swal.success('¡Reserva realizada!', `"${libro.titulo}" reservado por ${diasPrestamo} días`),
      error: (err) => this.swal.error('Error al reservar', err?.error?.message || 'No se pudo crear la reserva.'),
    });
  }

  async eliminar(libro: Libro) {
    const html = `<p class="swal-subtitulo">${libro.titulo}</p>
                  <p>Esta acción es permanente y no se puede deshacer.</p>`;
    const { isConfirmed } = await this.swal.danger('Eliminar Libro', html, 'Eliminar');
    if (!isConfirmed) return;

    this.libroService.delete(libro.idLibro).subscribe({
      next: () => {
        this.libros         = this.libros.filter(l => l.idLibro !== libro.idLibro);
        this.filteredLibros = this.filteredLibros.filter(l => l.idLibro !== libro.idLibro);
        this.swal.success('Libro eliminado');
      },
      error: (err) => this.swal.error('Error al eliminar', err?.error?.message || 'No se pudo eliminar el libro.'),
    });
  }

  doRefresh(event: any) { this.cargar(event); }

  esAdminOBibliotecario() { return ['admin', 'bibliotecario'].includes(this.rol); }
  esEstudiante()          { return this.rol === 'estudiante'; }
}
