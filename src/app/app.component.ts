import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import {
  IonApp, IonSplitPane, IonMenu, IonContent, IonList,
  IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, homeSharp,
  bookOutline, bookSharp,
  peopleOutline, peopleSharp,
  calendarOutline, calendarSharp,
  receiptOutline, receiptSharp,
  cashOutline, cashSharp,
  libraryOutline,
  logOutOutline,
  personOutline, lockClosedOutline,
  addOutline, searchOutline,
  eyeOutline, createOutline, trashOutline,
  checkmarkOutline, closeOutline,
  refreshCircleOutline, cardOutline,
  alertCircleOutline, trendingUpOutline,
  chevronForwardOutline, imageOutline,
  timeOutline, warningOutline,
  arrowBackOutline, checkmarkCircleOutline,
  closeCircleOutline, helpCircleOutline,
  menuOutline, cameraOutline,
  mailOutline, callOutline,
  shieldCheckmarkOutline, ellipseOutline,
} from 'ionicons/icons';
import { filter } from 'rxjs/operators';
import { TitleCasePipe } from '@angular/common';
import { AuthService }    from './core/services/auth.service';
import { UploadService }  from './core/services/upload.service';

interface MenuItem {
  title: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    RouterLink, RouterLinkActive, TitleCasePipe,
    IonApp, IonSplitPane, IonMenu, IonContent, IonList,
    IonListHeader, IonMenuToggle, IonItem, IonIcon, IonLabel,
    IonRouterOutlet,
  ],
})
export class AppComponent implements OnInit {
  showMenu  = false;
  menuItems: MenuItem[] = [];
  userName  = '';
  userRole  = '';
  fotoUrl   = '';
  fotoError = false;

  constructor(
    private authService:   AuthService,
    private uploadService: UploadService,
    private router:        Router,
  ) {
    addIcons({
      homeOutline, homeSharp, bookOutline, bookSharp,
      peopleOutline, peopleSharp, calendarOutline, calendarSharp,
      receiptOutline, receiptSharp, cashOutline, cashSharp,
      libraryOutline, logOutOutline, personOutline, lockClosedOutline,
      addOutline, searchOutline, eyeOutline, createOutline, trashOutline,
      checkmarkOutline, closeOutline, refreshCircleOutline, cardOutline,
      alertCircleOutline, trendingUpOutline, chevronForwardOutline,
      imageOutline, timeOutline, warningOutline, arrowBackOutline,
      checkmarkCircleOutline, closeCircleOutline, helpCircleOutline,
      menuOutline, cameraOutline, mailOutline, callOutline,
      shieldCheckmarkOutline, ellipseOutline,
    });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const isLoginPage = e.url === '/login' || e.url === '/';
      this.showMenu = !isLoginPage && this.authService.isLoggedIn();
      if (this.showMenu) {
        this.userName = this.authService.getNombre();
        this.userRole = this.authService.getRol();
        this.buildMenu();
        this.cargarAvatar();
      } else {
        this.liberarAvatar();
      }
    });
  }

  private blobAvatar = '';

  cargarAvatar() {
    const id = this.authService.getIdCuenta();
    if (!id) return;
    this.uploadService.getFotoUsuario(id).subscribe(url => {
      this.liberarAvatar();
      this.blobAvatar = url;
      this.fotoUrl    = url;
      this.fotoError  = !url;
    });
  }

  private liberarAvatar() {
    if (this.blobAvatar) {
      URL.revokeObjectURL(this.blobAvatar);
      this.blobAvatar = '';
    }
    this.fotoUrl = '';
  }

  onFotoError() {
    this.fotoError = true;
  }

  buildMenu() {
    const rol = this.authService.getRol();
    if (rol === 'admin') {
      this.menuItems = [
        { title: 'Dashboard', url: '/dashboard-admin',   icon: 'home' },
        { title: 'Libros',    url: '/libros',            icon: 'book' },
        { title: 'Usuarios',  url: '/usuarios',          icon: 'people' },
        { title: 'Reservas',  url: '/reservas',          icon: 'calendar' },
        { title: 'Préstamos', url: '/prestamos',         icon: 'receipt' },
        { title: 'Multas',    url: '/multas',            icon: 'cash' },
        { title: 'Mi Perfil', url: '/mi-perfil',         icon: 'person' },
      ];
    } else if (rol === 'bibliotecario') {
      this.menuItems = [
        { title: 'Dashboard', url: '/dashboard-bibliotecario', icon: 'home' },
        { title: 'Libros',    url: '/libros',                  icon: 'book' },
        { title: 'Usuarios',  url: '/usuarios',                icon: 'people' },
        { title: 'Reservas',  url: '/reservas',                icon: 'calendar' },
        { title: 'Préstamos', url: '/prestamos',               icon: 'receipt' },
        { title: 'Multas',    url: '/multas',                  icon: 'cash' },
        { title: 'Mi Perfil', url: '/mi-perfil',               icon: 'person' },
      ];
    } else {
      this.menuItems = [
        { title: 'Dashboard',     url: '/dashboard-estudiante', icon: 'home' },
        { title: 'Catálogo',      url: '/libros',               icon: 'book' },
        { title: 'Mis Reservas',  url: '/reservas/mis',         icon: 'calendar' },
        { title: 'Mis Préstamos', url: '/prestamos/mis',        icon: 'receipt' },
        { title: 'Mis Multas',    url: '/multas/mis',           icon: 'cash' },
        { title: 'Mi Perfil',     url: '/mi-perfil',            icon: 'person' },
      ];
    }
  }

  iniciales(): string {
    const parts = this.userName.split(' ');
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : this.userName.charAt(0).toUpperCase();
  }

  logout() {
    this.liberarAvatar();
    this.fotoError = false;
    this.showMenu  = false;
    this.authService.logout();
  }
}
