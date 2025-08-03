import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../services/product';
import { DatePipe } from '@angular/common';
import { ProductInterface } from '../interfaces/product.interface';
import { ProductForm } from '../product-form/product-form';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-table',
  imports: [DatePipe, ProductForm],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css'
})
export class ProductTable {
  productService = inject(ProductService);
  router = inject(Router);
  search = signal<string>("");
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  menuOpen = signal<string | null>(null);
  formOpen = signal(false);
  editProductData = signal<ProductInterface | null>(null);
  deleteModalOpen = signal(false);
  deleteProductData = signal<ProductInterface | null>(null);

  constructor() {
    this.productService.getProducts();
  }

  // Busqueda de los productos por el nombre
  filteredProducts = computed(() => {
    const term = this.search().toLocaleLowerCase();
    return this.productService.products().filter(product => product.name.toLocaleLowerCase().includes(term));
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
    this.pageIndex.set(0);
  }

  // Paginar los productos
  paginatedProducts = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  totalResults = computed(() => this.filteredProducts().length);

  // Calcular el total de paginas
  totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.pageSize());
  });

  changePageSize(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10);
    this.pageSize.set(value);
    this.pageIndex.set(0);
  }




  // Cambiar de pagina
  goToPage(index: number) {
    this.pageIndex.set(index);
  }

  // Menu de opciones
  openMenu(product: ProductInterface) {
    if (this.menuOpen() === product.id) {
      this.closeMenu();
      return;
    }
    this.menuOpen.set(product.id);
  }

  closeMenu() {
    this.menuOpen.set(null);
  }


  // Acciones, editar y eliminar productos
  editProduct(product: ProductInterface) {
    this.editProductData.set(product);
    this.formOpen.set(true);
    this.closeMenu();
  }

  deleteProduct(product: ProductInterface) {
    this.deleteProductData.set(product);
    this.deleteModalOpen.set(true);
    this.closeMenu();
  }

  closeDeleteModal() {
    this.deleteModalOpen.set(false);
    this.deleteProductData.set(null);
  }

  confirmDeleteProduct() {
    const product = this.deleteProductData();
    if (!product) return;
    this.productService.deleteProduct(product).subscribe(() => {
      this.productService.getProducts();
      this.closeDeleteModal();
    });
  }

  onDeleteBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop-delete')) {
      this.closeDeleteModal();
    }
  }

  // Abrir el formulario para agregar un nuevo producto
  openAddForm() {
    this.editProductData.set(null);
    this.formOpen.set(true);
  }

  closeForm() {
    this.formOpen.set(false);
    this.editProductData.set(null);
  }

  onFormSubmit(product: ProductInterface) {
    if (this.editProductData()) {
      this.productService.editProduct(product).subscribe(res => {
        if (res) {
          this.productService.getProducts();
          alert(res.message);
          this.closeForm();
        }
      });
    }
  }

  navigateToAddProduct() {
    this.router.navigate(['/add-product']);
  }



}
