import { inject, Injectable, signal } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = '/bp/products';
  readonly products = signal<ProductInterface[]>([]);
  readonly loading = signal<boolean>(false);
  private http = inject(HttpClient);

  constructor() { }


  // Metodo para poder obtener todos los productos
  getProducts() {
    this.loading.set(true);
    this.http.get<{ data: ProductInterface[] }>(this.apiUrl).pipe(
      takeUntilDestroyed(),
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
}
