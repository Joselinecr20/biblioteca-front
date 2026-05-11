import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonItem, IonLabel, IonInput,
  IonTextarea, IonSelect, IonSelectOption, IonSpinner,
  ToastController,
} from '@ionic/angular/standalone';
import { LibroService } from '../../../core/services/libro.service';

@Component({
  selector: 'app-form-libro',
  templateUrl: './form-libro.page.html',
  styleUrls:  ['./form-libro.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonItem, IonLabel, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonSpinner,
  ],
})
export class FormLibroPage implements OnInit {
  form:      FormGroup;
  libroId:   number | null = null;
  isEditing  = false;
  loading    = false;

  categorias = [
    { id: 1, nombre: 'Ciencias' },
    { id: 2, nombre: 'Tecnología' },
    { id: 3, nombre: 'Humanidades' },
    { id: 4, nombre: 'Literatura' },
    { id: 5, nombre: 'Historia' },
    { id: 6, nombre: 'Matemáticas' },
    { id: 7, nombre: 'Derecho' },
    { id: 8, nombre: 'Economía' },
    { id: 9, nombre: 'Arte' },
    { id: 10, nombre: 'Otros' },
  ];

  constructor(
    private fb:           FormBuilder,
    private route:        ActivatedRoute,
    private router:       Router,
    private libroService: LibroService,
    private toastCtrl:    ToastController,
  ) {
    this.form = this.fb.group({
      titulo:          ['', [Validators.required]],
      editorial:       ['', [Validators.required]],
      anioPublicacion: ['', [Validators.required, Validators.min(1000), Validators.max(2100)]],
      descripcion:     [''],
      isbn:            ['', [Validators.required]],
      idCategoria:     ['', [Validators.required]],
      portadaUrl:      [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.libroId   = Number(id);
      this.isEditing = true;
      this.libroService.getById(this.libroId).subscribe({
        next: (libro) => this.form.patchValue(libro),
        error: async () => {
          (await this.toastCtrl.create({
            message: 'Error al cargar el libro', duration: 3000, color: 'danger', position: 'top',
          })).present();
          this.router.navigate(['/libros']);
        },
      });
    }
  }

  async guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const datos  = this.form.value;
    const op     = this.isEditing && this.libroId
      ? this.libroService.update(this.libroId, datos)
      : this.libroService.create(datos);

    op.subscribe({
      next: async () => {
        this.loading = false;
        (await this.toastCtrl.create({
          message: this.isEditing ? 'Libro actualizado' : 'Libro creado',
          duration: 3000, color: 'success', position: 'top',
        })).present();
        this.router.navigate(['/libros']);
      },
      error: async (err) => {
        this.loading = false;
        (await this.toastCtrl.create({
          message: err?.error?.message || 'Error al guardar el libro',
          duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  cancelar() { this.router.navigate(['/libros']); }

  get f() { return this.form.controls; }
}
