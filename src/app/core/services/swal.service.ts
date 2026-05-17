import { Injectable, NgZone } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class SwalService {

  constructor(private zone: NgZone) {}

  private get theme(): SweetAlertOptions {
    return {
      background: '#F4EFE6',
      color: '#2B2B2B',
      confirmButtonColor: '#2F5D50',
      cancelButtonColor: '#7A5C3E',
      iconColor: '#C59B6D',
      customClass: { popup: 'swal-biblioteca' },
      allowOutsideClick: false,
      scrollbarPadding: false,
      topLayer: true,
    };
  }

  private fire(opts: SweetAlertOptions): Promise<SweetAlertResult> {
    const config: SweetAlertOptions = Object.assign({}, this.theme, opts);
    return this.zone.run(() => Swal.fire(config));
  }

  confirm(title: string, html: string, confirmText = 'Confirmar') {
    return this.fire({
      icon: 'question',
      title,
      html,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
    });
  }

  danger(title: string, html: string, confirmText = 'Sí, continuar') {
    return this.fire({
      icon: 'warning',
      title,
      html,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#7A5C3E',
      cancelButtonColor: '#2F5D50',
    });
  }

  success(title: string, text?: string) {
    return this.fire({
      icon: 'success',
      title,
      text,
      timer: 2200,
      showConfirmButton: false,
      timerProgressBar: true,
    });
  }

  error(title: string, text = 'Intenta nuevamente.') {
    return this.fire({
      icon: 'error',
      title,
      text,
      confirmButtonText: 'Entendido',
    });
  }

  toast(message: string, type: 'success' | 'error' | 'warning' = 'success'): Promise<SweetAlertResult> {
    const bg  = type === 'success' ? '#2F5D50' : type === 'error' ? '#7A5C3E' : '#C59B6D';
    const fg  = type === 'warning' ? '#2B2B2B' : '#F4EFE6';
    const config: SweetAlertOptions = {
      toast: true,
      position: 'top',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      background: bg,
      color: fg,
      iconColor: fg,
      customClass: { popup: 'swal-biblioteca-toast' },
      allowOutsideClick: true,
      scrollbarPadding: false,
    };
    return this.zone.run(() => Swal.fire(config));
  }

  async inputTexto(title: string, placeholder = '', valorInicial = ''): Promise<string | null> {
    const result = await this.fire({
      title,
      input: 'text',
      inputValue: valorInicial,
      inputPlaceholder: placeholder,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => (!value?.trim() ? 'El nombre no puede estar vacío' : null),
    });
    return result.isConfirmed ? (result.value as string).trim() : null;
  }

  async inputBiblioteca(title: string, nombre = '', ubicacion = ''): Promise<{ nombre: string; ubicacion: string } | null> {
    const result = await this.fire({
      title,
      html: `<input id="swal-nombre" class="swal2-input" placeholder="Nombre *" value="${nombre}">
             <input id="swal-ubicacion" class="swal2-input" placeholder="Ubicación (opcional)" value="${ubicacion}">`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const n = (document.getElementById('swal-nombre') as HTMLInputElement).value?.trim();
        if (!n) { Swal.showValidationMessage('El nombre es obligatorio'); return false; }
        return {
          nombre:    n,
          ubicacion: (document.getElementById('swal-ubicacion') as HTMLInputElement).value?.trim() ?? '',
        };
      },
    });
    return result.isConfirmed ? result.value : null;
  }

  async gestionarLista(
    title: string,
    items: { id: number; nombre: string }[],
  ): Promise<{ accion: 'editar' | 'eliminar'; id: number; nombre: string } | null> {
    if (items.length === 0) {
      await this.error('Sin elementos', 'No hay elementos para gestionar.');
      return null;
    }

    const inputOptions: Record<string, string> = {};
    items.forEach(i => { inputOptions[String(i.id)] = i.nombre; });

    const sel = await this.fire({
      title,
      input: 'select',
      inputOptions,
      inputValue: String(items[0].id),
      showCancelButton: true,
      confirmButtonText: 'Seleccionar',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => (!v ? 'Seleccione un elemento' : null),
    });
    if (!sel.isConfirmed) return null;

    const id   = Number(sel.value);
    const item = items.find(i => i.id === id)!;

    let accionElegida: 'editar' | 'eliminar' | null = null;

    const accion = await this.fire({
      title: item.nombre,
      html: `<p class="swal-subtitulo">¿Qué desea hacer?</p>
             <div class="swal-menu-lista">
               <button type="button" class="swal-menu-item" data-accion="editar">
                 <span class="swal-menu-icono">✏️</span>
                 <span class="swal-menu-texto">Editar nombre</span>
               </button>
               <button type="button" class="swal-menu-item swal-menu-danger" data-accion="eliminar">
                 <span class="swal-menu-icono">🗑️</span>
                 <span class="swal-menu-texto">Eliminar</span>
               </button>
             </div>`,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        document.querySelectorAll('.swal-menu-item').forEach(btn => {
          btn.addEventListener('click', () => {
            accionElegida = (btn as HTMLElement).dataset['accion'] as 'editar' | 'eliminar';
            Swal.clickConfirm();
          });
        });
      },
      preConfirm: () => accionElegida,
    });

    if (accion.isConfirmed && accionElegida === 'editar')   return { accion: 'editar',   id, nombre: item.nombre };
    if (accion.isConfirmed && accionElegida === 'eliminar') return { accion: 'eliminar', id, nombre: item.nombre };
    return null;
  }

  async selectBiblioteca(bibliotecas: { idBiblioteca: number; nombre: string; cantidadDisponible: number }[]): Promise<number | null> {
    if (bibliotecas.length === 1) return bibliotecas[0].idBiblioteca;

    const inputOptions: Record<string, string> = {};
    bibliotecas.forEach(b => {
      inputOptions[b.idBiblioteca] = `${b.nombre} (${b.cantidadDisponible} disponible${b.cantidadDisponible !== 1 ? 's' : ''})`;
    });

    const result = await this.fire({
      title: 'Seleccionar Biblioteca',
      input: 'select',
      inputOptions,
      inputValue: String(bibliotecas[0].idBiblioteca),
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => (!value ? 'Seleccione una biblioteca' : null),
    });

    return result.isConfirmed ? Number(result.value) : null;
  }

  async selectDias(tituloLibro: string): Promise<number | null> {
    let diasSeleccionados = 3;

    const config: SweetAlertOptions = Object.assign({}, this.theme, {
      title: 'Reservar Libro',
      html: `<p class="swal-subtitulo">${tituloLibro}</p>
             <p class="dias-pregunta">¿Cuántos días necesita el libro?</p>
             <div class="dias-cards">
               <button type="button" class="dia-opcion activo" data-dias="3">
                 <span class="dia-numero">3</span>
                 <span class="dia-label">días</span>
               </button>
               <button type="button" class="dia-opcion" data-dias="7">
                 <span class="dia-numero">7</span>
                 <span class="dia-label">días</span>
               </button>
               <button type="button" class="dia-opcion" data-dias="14">
                 <span class="dia-numero">14</span>
                 <span class="dia-label">días</span>
               </button>
             </div>`,
      showCancelButton: true,
      confirmButtonText: 'Reservar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        document.querySelectorAll('.dia-opcion').forEach(btn => {
          btn.addEventListener('click', () => {
            document.querySelectorAll('.dia-opcion').forEach(b => b.classList.remove('activo'));
            btn.classList.add('activo');
            diasSeleccionados = Number((btn as HTMLElement).dataset['dias']);
          });
        });
      },
      preConfirm: () => diasSeleccionados,
    });

    const result = await this.zone.run(() => Swal.fire(config));
    return result.isConfirmed ? result.value : null;
  }
}
