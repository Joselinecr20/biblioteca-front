import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls:  ['./menu.component.scss'],
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive,
    IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
  ],
})
export class MenuComponent implements OnInit {
  menuItems: MenuItem[] = [];
  nombre = '';

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.nombre = this.auth.getNombre();
    const rol   = this.auth.getRol();

    if (rol === 'admin') {
      this.menuItems = [
        { title: 'Dashboard', url: '/dashboard-admin',   icon: 'home' },
        { title: 'Libros',    url: '/libros',            icon: 'book' },
        { title: 'Usuarios',  url: '/usuarios',          icon: 'people' },
        { title: 'Reservas',  url: '/reservas',          icon: 'calendar' },
        { title: 'Préstamos', url: '/prestamos',         icon: 'receipt' },
        { title: 'Multas',    url: '/multas',            icon: 'cash' },
      ];
    } else if (rol === 'bibliotecario') {
      this.menuItems = [
        { title: 'Dashboard', url: '/dashboard-bibliotecario', icon: 'home' },
        { title: 'Libros',    url: '/libros',                  icon: 'book' },
        { title: 'Usuarios',  url: '/usuarios',                icon: 'people' },
        { title: 'Reservas',  url: '/reservas',                icon: 'calendar' },
        { title: 'Préstamos', url: '/prestamos',               icon: 'receipt' },
        { title: 'Multas',    url: '/multas',                  icon: 'cash' },
      ];
    } else {
      this.menuItems = [
        { title: 'Dashboard',     url: '/dashboard-estudiante', icon: 'home' },
        { title: 'Catálogo',      url: '/libros',               icon: 'book' },
        { title: 'Mis Reservas',  url: '/reservas/mis',         icon: 'calendar' },
        { title: 'Mis Préstamos', url: '/prestamos/mis',        icon: 'receipt' },
        { title: 'Mis Multas',    url: '/multas/mis',           icon: 'cash' },
      ];
    }
  }

  logout() {
    this.auth.logout();
  }
}
