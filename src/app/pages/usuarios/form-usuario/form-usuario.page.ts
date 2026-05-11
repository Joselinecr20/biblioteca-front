import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonItem, IonLabel, IonInput,
  IonSelect, IonSelectOption, IonSpinner, IonToggle,
  ToastController,
} from '@ionic/angular/standalone';
import { UsuarioService } from '../../../core/services/usuario.service';
import { ImagePickerComponent } from '../../../shared/components/image-picker/image-picker.component';

@Component({
  selector: 'app-form-usuario',
  templateUrl: './form-usuario.page.html',
  styleUrls:  ['./form-usuario.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonItem, IonLabel, IonInput,
    IonSelect, IonSelectOption, IonSpinner, IonToggle,
    ImagePickerComponent,
  ],
})
export class FormUsuarioPage implements OnInit {
  form:      FormGroup;
  usuarioId: number | null = null;
  isEditing  = false;
  loading    = false;

  roles = ['admin', 'bibliotecario', 'estudiante'];

  constructor(
    private fb:             FormBuilder,
    private route:          ActivatedRoute,
    private router:         Router,
    private usuarioService: UsuarioService,
    private toastCtrl:      ToastController,
  ) {
    this.form = this.fb.group({
      usuario:   ['', [Validators.required]],
      password:  ['', [Validators.required, Validators.minLength(6)]],
      nombre:    ['', [Validators.required]],
      apellido:  ['', [Validators.required]],
      correo:    ['', [Validators.required, Validators.email]],
      telefono:  [''],
      rol:       ['estudiante', [Validators.required]],
      activo:    [true],
      fotoUrl:   [''],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nuevo') {
      this.usuarioId = Number(id);
      this.isEditing  = true;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.setValidators([Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();

      this.usuarioService.getById(this.usuarioId).subscribe({
        next:  (u) => this.form.patchValue(u),
        error: async () => {
          (await this.toastCtrl.create({
            message: 'Error al cargar usuario', duration: 3000, color: 'danger', position: 'top',
          })).present();
          this.router.navigate(['/usuarios']);
        },
      });
    }
  }

  async guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const datos  = this.form.value;

    const op = this.isEditing && this.usuarioId
      ? this.usuarioService.update(this.usuarioId, datos)
      : this.usuarioService.create(datos);

    op.subscribe({
      next: async () => {
        this.loading = false;
        (await this.toastCtrl.create({
          message: this.isEditing ? 'Usuario actualizado' : 'Usuario creado',
          duration: 3000, color: 'success', position: 'top',
        })).present();
        this.router.navigate(['/usuarios']);
      },
      error: async (err) => {
        this.loading = false;
        (await this.toastCtrl.create({
          message: err?.error?.message || 'Error al guardar usuario',
          duration: 3000, color: 'danger', position: 'top',
        })).present();
      },
    });
  }

  onFotoSubida() {}

  get f() { return this.form.controls; }
}
