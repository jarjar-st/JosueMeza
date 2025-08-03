import { Component, computed, EventEmitter, inject, Input, OnChanges, Output, signal, SimpleChanges } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { ProductService } from '../services/product';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-form',
  imports: [DatePipe],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnChanges {

  constructor() {
    if (!this.isModal) {
      this.resetForm();
    }
  }

  @Input() open: boolean = false;
  @Input() product: ProductInterface | null = null;
  @Input() isModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<ProductInterface>();
  router = inject(Router);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      if (this.product) {
        this.isEdit.set(true);
        this.id.set(this.product.id);
        this.name.set(this.product.name);
        this.description.set(this.product.description);
        this.logo.set(this.product.logo);
        this.date_release.set(new Date(this.product.date_release));
        this.date_revision.set(new Date(this.product.date_revision));
      } else {
        this.isEdit.set(false);
        const releaseDate = new Date();
        this.date_release.set(releaseDate);
        const revisionDate = new Date(releaseDate);
        revisionDate.setFullYear(revisionDate.getFullYear() + 1);
        this.date_revision.set(revisionDate);
        this.resetForm(false);
      }
    }
  }

  productService = inject(ProductService);

  // Campos del Form
  id = signal<string>(this.product?.id ?? "");
  name = signal<string>(this.product?.name ?? "");
  description = signal<string>(this.product?.description ?? "");
  logo = signal<string>(this.product?.logo ?? "");
  date_release = signal<Date>(this.product?.date_release ? new Date(this.product.date_release) : new Date());
  date_revision = signal<Date>(this.product?.date_revision ? new Date(this.product.date_revision) : new Date());
  isEdit = signal<boolean>(false);

  erros = signal<{ [key: string]: string }>({});
  idChecked = signal<boolean>(false);
  idExists = signal<boolean>(false);

  // isEdit = computed(() => this.product);

  validateForm() {

    const errors: { [key: string]: string } = {};

    // Validar ID
    if (!this.id()) errors["id"] = "El ID es requerido";
    else if (this.id().length < 3) errors["id"] = "El ID debe tener al menos 3 caracteres";
    else if (this.id().length > 10) errors["id"] = "El ID debe tener máximo 10 caracteres";
    else if (!this.isEdit() && this.idExists()) errors["id"] = "El ID ya existe";

    // Validar Nombre
    if (!this.name()) errors["name"] = "El nombre es requerido";
    else if (this.name().length < 5) errors["name"] = "El nombre debe tener al menos 5 caracteres";
    else if (this.name().length > 10) errors["name"] = "El nombre debe tener máximo 10 caracteres";

    // Validar Descripción
    if (!this.description()) errors["description"] = "La descripción es requerida";
    else if (this.description().length < 10) errors["description"] = "La descripción debe tener al menos 10 caracteres";
    else if (this.description().length > 200) errors["description"] = "La descripción debe tener máximo 200 caracteres";


    // Validar Logo
    if (!this.logo()) errors["logo"] = "El logo es requerido";

    // Validar Fecha de Liberacion
    if (!this.date_release()) errors["date_release"] = "La fecha de Liberacion es requerida";
    else if (this.date_release() < new Date()) errors["date_release"] = "La fecha de Liberacion debe ser una fecha futura o igual a hoy";

    // Validar Fecha de Revision
    if (!this.date_revision()) errors["date_revision"] = "La fecha de Revision es requerida";
    else if (
      this.date_release() &&
      (this.date_revision().getFullYear() !== this.date_release().getFullYear() + 1 ||
        this.date_revision().getMonth() !== this.date_release().getMonth() ||
        this.date_revision().getDate() !== this.date_release().getDate())
    ) errors["date_revision"] = "La fecha de revisión debe ser exactamente un año después de la liberación";
    this.erros.set(errors);
    return Object.keys(errors).length === 0;

  }
  protected fillId(event: Event) {
    const input = event.target as HTMLInputElement;
    this.id.set(input.value);
    this.checkId();

  }
  protected fillName(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);

  }
  protected fillDescription(event: Event) {
    const input = event.target as HTMLInputElement;
    this.description.set(input.value);

  }
  protected fillLogo(event: Event) {
    const input = event.target as HTMLInputElement;
    this.logo.set(input.value);

  }

  fillDateRelease(event: Event | null) {
    const input = event?.target as HTMLInputElement;
    const releaseDate = new Date(input.value);
    this.date_release.set(releaseDate);

    // Actualiza automáticamente date_revision
    const revisionDate = new Date(releaseDate);
    revisionDate.setFullYear(revisionDate.getFullYear() + 1);
    this.date_revision.set(revisionDate);
  }



  // Verificar si el ID ya existe
  checkId() {
    if (!this.id() || this.id().length < 3) return;
    this.productService.idExistsVerification(this.id()).subscribe(exists => {
      this.idExists.set(exists);
    });
  }

  // Resetear el formulario

  resetForm(resetDates: boolean = true) {
    if (!this.isEdit()) {
      this.id.set("");
    }
    this.name.set("");
    this.description.set("");
    this.logo.set("");
    if (resetDates) {
      const releaseDate = new Date();
      this.date_release.set(releaseDate);
      const revisionDate = new Date(releaseDate);
      revisionDate.setFullYear(revisionDate.getFullYear() + 1);
      this.date_revision.set(revisionDate);
    }
    this.erros.set({});
    this.idExists.set(false);
  }

  // Enviar el formulario
  onSubmit() {

    if (!this.validateForm()) {
      return;
    }
    const product: ProductInterface = {
      id: this.id(),
      name: this.name(),
      description: this.description(),
      logo: this.logo(),
      date_release: this.date_release(),
      date_revision: this.date_revision()
    };
    if (!this.isModal) {
      this.productService.addProduct(product).subscribe(res => {
        if (res) {
          this.productService.getProducts();
          alert(res.message);
          this.resetForm();
          this.router.navigate(['/']);
        }
      });

    }
    this.submit.emit(product);
    this.resetForm();


  }

  // Cerrar el formulario
  onClose() {
    if (this.isModal) {
      this.resetForm();
      this.close.emit();
    } else {
      this.router.navigate(['/']);
    }
  }



  //  Metodo para cerrar el modal al hacer click fuera
  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }

}
