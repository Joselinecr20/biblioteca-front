import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonCard, IonCardContent, IonItem, IonLabel,
  IonInput, IonButton, IonSpinner, IonIcon,
  ToastController,
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls:  ['./login.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonContent, IonCard, IonCardContent, IonItem, IonLabel,
    IonInput, IonButton, IonSpinner, IonIcon,
  ],
})
export class LoginPage {
  form: FormGroup;
  loading = false;

  constructor(
    private fb:       FormBuilder,
    private auth:     AuthService,
    private router:   Router,
    private toastCtrl: ToastController,
  ) {
    this.form = this.fb.group({
      usuario:  ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.loading = false;
        this.auth.redirectToDashboard();
      },
      error: async (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Credenciales incorrectas. Intente de nuevo.';
        const toast = await this.toastCtrl.create({
          message: msg, duration: 3500, color: 'danger', position: 'top',
        });
        await toast.present();
      },
    });
  }

  get u() { return this.form.get('usuario'); }
  get p() { return this.form.get('password'); }
}
