import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons,
  IonMenuButton, IonBackButton, IonButton, IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls:  ['./header.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonButtons,
    IonMenuButton, IonBackButton, IonButton, IonIcon,
  ],
})
export class HeaderComponent {
  @Input() title     = '';
  @Input() showBack  = false;
  @Input() backHref  = '/';
  @Input() backText  = 'Atrás';

  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
  }
}
