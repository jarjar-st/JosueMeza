import { inject, Injectable, signal } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = '/bp/products';
  readonly products = signal<ProductInterface[]>([]);
  readonly loading = signal<boolean>(false);
  readonly idExists = signal<boolean>(false);
  private http = inject(HttpClient);

  constructor() { }


  // Metodo para poder obtener todos los productos
  getProducts() {
    this.loading.set(true);
    this.http.get<{ data: ProductInterface[] }>(this.apiUrl).pipe(
      catchError((error) => {
        console.log("Error al obtener los productos:", error);
        this.loading.set(false);
        return of({ data: [] });
      }),
      finalize(() => this.loading.set(false))
    ).subscribe((resp) => {
      this.products.set(resp.data);
    });
  }

  // Metodo para verificar si el ID ya existe
  idExistsVerification(id: String) {
    return this.http.get<boolean>(`${this.apiUrl}/verification/${id}`).pipe(
      catchError((error) => {
        console.log("Error al verificar el ID:", error);
        return of(true);
      })
    );
  }

  // Metodo para agregar un nuevo producto
  addProduct(product: ProductInterface){
    this.loading.set(true);
    return this.http.post<ProductInterface>(this.apiUrl, product).pipe(
      catchError((error) => {
        console.log("Error al agregar el producto:", error);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  // Metodo para editar un producto existente
  editProduct(product: ProductInterface) {
    this.loading.set(true);
    return this.http.put(`/bp/products/${product.id}`, product).pipe(
      catchError((error) => {
        console.log("Error al editar el producto:", error);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }

  // Metodo para eliminar un producto
  deleteProduct(product: ProductInterface) {
    this.loading.set(true);
    return this.http.delete(`${this.apiUrl}/${product.id}`).pipe(
      catchError((error) => {
        console.log("Error al eliminar el producto:", error);
        return of(null);
      }),
      finalize(() => this.loading.set(false))
    );
  }
}
