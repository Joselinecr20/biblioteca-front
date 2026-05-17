import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonButton, IonItem, IonLabel, IonInput,
  IonTextarea, IonSelect, IonSelectOption, IonSpinner, IonNote,
  ToastController,
} from '@ionic/angular/standalone';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LibroService }      from '../../../core/services/libro.service';
import { BibliotecaService, BibliotecaItem } from '../../../core/services/biblioteca.service';
import { CategoriaService, CategoriaItem }   from '../../../core/services/categoria.service';
import { SwalService }                        from '../../../core/services/swal.service';

interface StockItem {
  idBiblioteca: number;
  nombre: string;
  ubicacion: string;
  cantidad: number;
}

@Component({
  selector: 'app-form-libro',
  templateUrl: './form-libro.page.html',
  styleUrls:  ['./form-libro.page.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonBackButton, IonButton, IonItem, IonLabel, IonInput,
    IonTextarea, IonSelect, IonSelectOption, IonSpinner, IonNote,
  ],
})
export class FormLibroPage implements OnInit {
  form:       FormGroup;
  libroId:    number | null = null;
  isEditing   = false;
  loading     = false;
  stockItems: StockItem[]    = [];
  categorias: CategoriaItem[] = [];

  constructor(
    private fb:               FormBuilder,
    private route:            ActivatedRoute,
    private router:           Router,
    private libroService:     LibroService,
    private bibliotecaService: BibliotecaService,
    private categoriaService: CategoriaService,
    private swal:             SwalService,
    private toastCtrl:        ToastController,
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

      forkJoin({
        libro:       this.libroService.getById(this.libroId),
        bibliotecas: this.bibliotecaService.getAll(),
        categorias:  this.categoriaService.getAll(),
      }).subscribe({
        next: ({ libro, bibliotecas, categorias }) => {
          this.categorias = categorias;
          this.form.patchValue(libro);
          this.initStock(bibliotecas, libro.bibliotecas ?? []);
        },
        error: async () => {
          (await this.toastCtrl.create({
            message: 'Error al cargar el libro', duration: 3000, color: 'danger', position: 'top',
          })).present();
          this.router.navigate(['/libros']);
        },
      });
    } else {
      forkJoin({
        bibliotecas: this.bibliotecaService.getAll(),
        categorias:  this.categoriaService.getAll(),
      }).subscribe({
        next: ({ bibliotecas, categorias }) => {
          this.categorias = categorias;
          this.initStock(bibliotecas, []);
        },
        error: () => {},
      });
    }
  }

  private initStock(
    all:      BibliotecaItem[],
    existing: { idBiblioteca: number; cantidadTotal?: number; cantidadDisponible: number }[],
  ) {
    this.stockItems = all.map(b => {
      const found = existing.find(e => e.idBiblioteca === b.idBiblioteca);
      return { idBiblioteca: b.idBiblioteca, nombre: b.nombre, ubicacion: b.ubicacion ?? '', cantidad: found?.cantidadTotal ?? 0 };
    });
  }

  onStockInput(item: StockItem, event: Event) {
    item.cantidad = Math.max(0, Number((event as CustomEvent).detail.value) || 0);
  }

  async agregarCategoria() {
    const nombre = await this.swal.inputTexto('Nueva Categoría', 'Nombre de la categoría');
    if (!nombre) return;

    this.categoriaService.create(nombre).subscribe({
      next: (nueva) => {
        this.categorias = [...this.categorias, nueva].sort((a, b) => a.nombre.localeCompare(b.nombre));
        this.form.patchValue({ idCategoria: nueva.idCategoria });
        this.swal.toast(`Categoría "${nueva.nombre}" creada`, 'success');
      },
      error: (err) => this.swal.error('Error', err?.error?.message || 'No se pudo crear la categoría.'),
    });
  }

  async gestionarCategorias() {
    const res = await this.swal.gestionarLista(
      'Gestionar Categorías',
      this.categorias.map(c => ({ id: c.idCategoria, nombre: c.nombre })),
    );
    if (!res) return;

    if (res.accion === 'editar') {
      const nuevoNombre = await this.swal.inputTexto('Editar categoría', res.nombre, res.nombre);
      if (!nuevoNombre || nuevoNombre === res.nombre) return;

      this.categoriaService.update(res.id, nuevoNombre).subscribe({
        next: (actualizada) => {
          const idx = this.categorias.findIndex(c => c.idCategoria === res.id);
          if (idx !== -1) this.categorias[idx] = actualizada;
          this.categorias = [...this.categorias].sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.swal.toast('Categoría actualizada', 'success');
        },
        error: (err) => this.swal.error('Error', err?.error?.message || 'No se pudo actualizar.'),
      });
    } else {
      const { isConfirmed } = await this.swal.danger(
        'Eliminar Categoría',
        `<p class="swal-subtitulo">${res.nombre}</p><p>Solo se puede eliminar si no hay libros asignados.</p>`,
        'Eliminar',
      );
      if (!isConfirmed) return;

      this.categoriaService.delete(res.id).subscribe({
        next: () => {
          this.categorias = this.categorias.filter(c => c.idCategoria !== res.id);
          if (this.form.value.idCategoria === res.id) this.form.patchValue({ idCategoria: '' });
          this.swal.toast('Categoría eliminada', 'success');
        },
        error: (err) => this.swal.error('No se pudo eliminar', err?.error?.message || 'Intenta nuevamente.'),
      });
    }
  }

  async agregarBiblioteca() {
    const datos = await this.swal.inputBiblioteca('Nueva Biblioteca');
    if (!datos) return;

    this.bibliotecaService.create(datos.nombre, datos.ubicacion).subscribe({
      next: (nueva) => {
        this.stockItems = [...this.stockItems, { idBiblioteca: nueva.idBiblioteca, nombre: nueva.nombre, ubicacion: nueva.ubicacion ?? '', cantidad: 0 }];
        this.swal.toast(`Biblioteca "${nueva.nombre}" creada`, 'success');
      },
      error: (err) => this.swal.error('Error', err?.error?.message || 'No se pudo crear la biblioteca.'),
    });
  }

  async gestionarBibliotecas() {
    const res = await this.swal.gestionarLista(
      'Gestionar Bibliotecas',
      this.stockItems.map(s => ({ id: s.idBiblioteca, nombre: s.nombre })),
    );
    if (!res) return;

    if (res.accion === 'editar') {
      const stockActual = this.stockItems.find(s => s.idBiblioteca === res.id);
      const datos = await this.swal.inputBiblioteca('Editar Biblioteca', res.nombre, stockActual?.ubicacion ?? '');
      if (!datos) return;

      this.bibliotecaService.update(res.id, datos.nombre, datos.ubicacion).subscribe({
        next: (actualizada) => {
          const idx = this.stockItems.findIndex(s => s.idBiblioteca === res.id);
          if (idx !== -1) this.stockItems[idx] = { ...this.stockItems[idx], nombre: actualizada.nombre, ubicacion: actualizada.ubicacion ?? '' };
          this.stockItems = [...this.stockItems];
          this.swal.toast('Biblioteca actualizada', 'success');
        },
        error: (err) => this.swal.error('Error', err?.error?.message || 'No se pudo actualizar.'),
      });
    } else {
      const { isConfirmed } = await this.swal.danger(
        'Eliminar Biblioteca',
        `<p class="swal-subtitulo">${res.nombre}</p><p>Solo se puede eliminar si no tiene libros asignados.</p>`,
        'Eliminar',
      );
      if (!isConfirmed) return;

      this.bibliotecaService.delete(res.id).subscribe({
        next: () => {
          this.stockItems = this.stockItems.filter(s => s.idBiblioteca !== res.id);
          this.swal.toast('Biblioteca eliminada', 'success');
        },
        error: (err) => this.swal.error('No se pudo eliminar', err?.error?.message || 'Intenta nuevamente.'),
      });
    }
  }

  async guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading = true;
    const datos  = this.form.value;
    const stockPayload = this.stockItems
      .filter(s => s.cantidad > 0)
      .map(s => ({ idBiblioteca: s.idBiblioteca, cantidadTotal: s.cantidad }));

    const saveOp = this.isEditing && this.libroId
      ? this.libroService.update(this.libroId, datos)
      : this.libroService.create(datos);

    saveOp.pipe(
      switchMap(savedLibro =>
        stockPayload.length > 0
          ? this.libroService.setStock(savedLibro.idLibro, stockPayload)
          : of(savedLibro)
      ),
    ).subscribe({
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

  compareById(o1: number | string, o2: number | string): boolean {
    return Number(o1) === Number(o2);
  }

  get f() { return this.form.controls; }
}
