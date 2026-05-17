import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
  IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
  IonNote,
} from '@ionic/angular/standalone';
import { DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { MultaService } from '../../../core/services/multa.service';
import { SwalService }  from '../../../core/services/swal.service';
import { Multa } from '../../../core/models';

@Component({
  selector: 'app-lista-multas',
  templateUrl: './lista-multas.page.html',
  styleUrls:  ['./lista-multas.page.scss'],
  standalone: true,
  imports: [
    DatePipe, CurrencyPipe, TitleCasePipe,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonList, IonItem, IonLabel, IonBadge,
    IonButton, IonIcon, IonSkeletonText, IonRefresher, IonRefresherContent,
    IonNote,
  ],
})
export class ListaMultasPage implements OnInit {
  multas:  Multa[] = [];
  loading  = true;

  constructor(
    private multaService: MultaService,
    private swal:         SwalService,
  ) {}

  ngOnInit() { this.cargar(); }

  cargar(event?: any) {
    this.loading = true;
    this.multaService.getAll().subscribe({
      next: (data) => {
        this.multas  = data.sort((a, b) => new Date(b.fechaGeneracion).getTime() - new Date(a.fechaGeneracion).getTime());
        this.loading = false;
        event?.target?.complete();
      },
      error: () => {
        this.loading = false;
        event?.target?.complete();
        this.swal.toast('Error al cargar multas', 'error');
      },
    });
  }

  async registrarPago(m: Multa) {
    const html = `<p class="swal-subtitulo">Monto: <strong>$${m.monto.toFixed(2)}</strong></p>
                  <p>¿Confirmar el pago de esta multa?</p>`;
    const { isConfirmed } = await this.swal.confirm('Registrar Pago', html, 'Confirmar Pago');
    if (!isConfirmed) return;

    this.multaService.pagar(m.idMulta).subscribe({
      next: (updated) => {
        const idx = this.multas.findIndex(x => x.idMulta === m.idMulta);
        if (idx !== -1) this.multas[idx] = updated;
        this.swal.success('Pago registrado exitosamente');
      },
      error: (err) => this.swal.error('Error al registrar', err?.error?.message || 'No se pudo registrar el pago.'),
    });
  }

  doRefresh(event: any) { this.cargar(event); }
}
