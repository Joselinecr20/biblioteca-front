import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonCard, IonCardContent, IonBadge,
  IonButton, IonIcon, IonSkeletonText,
} from '@ionic/angular/standalone';
import { LibroService }   from '../../../core/services/libro.service';
import { ReservaService } from '../../../core/services/reserva.service';
import { AuthService }    from '../../../core/services/auth.service';
import { UploadService }  from '../../../core/services/upload.service';
import { SwalService }    from '../../../core/services/swal.service';
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
    private swal:           SwalService,
  ) {}

  ngOnInit() {
    this.rol = this.auth.getRol();
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.libroService.getById(id).subscribe({
      next:  (l) => {
        this.libro   = l;
        this.loading = false;
        this.cargarPortada(l.idLibro);
      },
      error: () => {
        this.loading = false;
        this.swal.toast('Error al cargar el libro', 'error');
        this.router.navigate(['/libros']);
      },
    });
  }

  async reservar() {
    if (!this.libro) return;

    const bibliotecas = this.libro.bibliotecas ?? [];
    if (bibliotecas.length === 0) {
      this.swal.error('Sin disponibilidad', 'No hay ejemplares disponibles en ninguna biblioteca.');
      return;
    }

    const idBiblioteca = await this.swal.selectBiblioteca(bibliotecas);
    if (!idBiblioteca) return;

    const diasPrestamo = await this.swal.selectDias(this.libro.titulo);
    if (!diasPrestamo) return;

    this.reservaService.create({
      idLibro: this.libro.idLibro,
      idBiblioteca,
      diasPrestamo,
    }).subscribe({
      next: async () => {
        await this.swal.success('¡Reserva creada!', `"${this.libro!.titulo}" reservado por ${diasPrestamo} días`);
        this.router.navigate(['/reservas/mis']);
      },
      error: (err) => this.swal.error('Error al reservar', err?.error?.message || 'No se pudo crear la reserva.'),
    });
  }

  async eliminar() {
    if (!this.libro) return;
    const html = `<p class="swal-subtitulo">${this.libro.titulo}</p>
                  <p>Esta acción es permanente y no se puede deshacer.</p>`;
    const { isConfirmed } = await this.swal.danger('Eliminar Libro', html, 'Eliminar');
    if (!isConfirmed) return;

    this.libroService.delete(this.libro.idLibro).subscribe({
      next: async () => {
        await this.swal.success('Libro eliminado');
        this.router.navigate(['/libros']);
      },
      error: (err) => this.swal.error('Error al eliminar', err?.error?.message || 'No se pudo eliminar el libro.'),
    });
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
