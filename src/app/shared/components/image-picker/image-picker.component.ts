import {
  Component, Input, Output, EventEmitter,
  ViewChild, ElementRef, OnInit, OnChanges, SimpleChanges, OnDestroy,
} from '@angular/core';
import { IonIcon, IonSpinner, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, personOutline, imageOutline } from 'ionicons/icons';
import { UploadService } from '../../../core/services/upload.service';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls:  ['./image-picker.component.scss'],
  standalone: true,
  imports: [IonIcon, IonSpinner],
})
export class ImagePickerComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tipo: 'usuario' | 'libro' = 'usuario';
  @Input() id: number = 0;
  @Output() imagenSubida = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  urlMostrada: string = '';
  previewUrl:  string | null = null;
  subiendo     = false;

  private blobUrl = '';

  constructor(
    private uploadService: UploadService,
    private toastCtrl:     ToastController,
  ) {
    addIcons({ cameraOutline, personOutline, imageOutline });
  }

  ngOnInit() {
    this.cargarImagen();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ((changes['id'] || changes['tipo']) && this.id > 0) {
      this.cargarImagen();
    }
  }

  ngOnDestroy() {
    this.liberarBlob();
  }

  private cargarImagen() {
    if (this.id <= 0) return;
    const obs = this.tipo === 'usuario'
      ? this.uploadService.getFotoUsuario(this.id)
      : this.uploadService.getPortadaLibro(this.id);

    obs.subscribe(url => {
      this.liberarBlob();
      this.blobUrl     = url;
      this.urlMostrada = url;
    });
  }

  private liberarBlob() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = '';
    }
  }

  get imagenVisible(): string {
    return this.previewUrl || this.urlMostrada;
  }

  onImgError() {
    this.urlMostrada = '';
  }

  seleccionar() {
    if (this.id === 0) {
      this.toast('Guarda el registro primero para poder subir una imagen', 'warning');
      return;
    }
    this.fileInput.nativeElement.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(file.type)) {
      await this.toast('Solo se permiten imágenes JPG, PNG o WebP', 'danger');
      input.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      await this.toast('La imagen no debe superar los 5 MB', 'danger');
      input.value = '';
      return;
    }

    this.previewUrl = await this.leerArchivo(file);
    input.value     = '';
    this.subiendo   = true;

    const op = this.tipo === 'usuario'
      ? this.uploadService.subirFotoUsuario(this.id, file)
      : this.uploadService.subirPortadaLibro(this.id, file);

    op.subscribe({
      next: async () => {
        this.subiendo   = false;
        this.previewUrl = null;
        // Recargar imagen desde el servidor
        this.cargarImagen();
        this.imagenSubida.emit();
        await this.toast('Imagen actualizada correctamente', 'success');
      },
      error: async (err) => {
        this.subiendo   = false;
        this.previewUrl = null;
        await this.toast(err?.error?.message || 'Error al subir la imagen', 'danger');
      },
    });
  }

  private leerArchivo(file: File): Promise<string> {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target!.result as string);
      reader.readAsDataURL(file);
    });
  }

  private async toast(message: string, color: string) {
    (await this.toastCtrl.create({ message, duration: 3500, color, position: 'top' })).present();
  }
}
