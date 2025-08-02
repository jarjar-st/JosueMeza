import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../services/product';
import { DatePipe } from '@angular/common';
import { ProductInterface } from '../interfaces/product.interface';

@Component({
  selector: 'app-product-table',
  imports: [DatePipe],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css'
})
export class ProductTable {
[x: string]: any;
  productService = inject(ProductService);
  search = signal<string>("");
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);
  menuOpen = signal<string | null>(null);
  constructor() {
    this.productService.getProducts();
  }

  // Busqueda de los productos por el nombre
  protected filteredProducts = computed(() => {
    const term = this.search().toLocaleLowerCase();
    return this.productService.products().filter(product => product.name.toLocaleLowerCase().includes(term));
  });

  protected onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
    this.pageIndex.set(0);
  }

  // Paginar los productos
  protected paginatedProducts = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredProducts().slice(start, end);
  });

  protected totalResults = computed(() => this.filteredProducts().length);

  // Calcular el total de paginas
  protected totalPages = computed(() => {
    return Math.ceil(this.filteredProducts().length / this.pageSize());
  });

  protected changePageSize(event: Event) {
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
    console.log("Menu abierto para el producto:", product.name);
  }

  closeMenu() {
    this.menuOpen.set(null);
  }


  // Acciones, editar y eliminar productos
  editProduct(product: ProductInterface) {
    console.log("Editar producto:", product.name);
    this.closeMenu();
  }

  deleteProduct(product: ProductInterface) {
    console.log("Producto eliminado:", product.name);
    this.closeMenu();
  }

  openAddForm() {
    console.log("Abrir formulario para agregar un nuevo producto");
  }

}
