import { inject, Injectable, signal } from '@angular/core';
import { ProductInterface } from '../interfaces/product.interface';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = 'http://localhost:3000/bp/products';
  readonly products = signal<ProductInterface[]>([]);
  readonly loading = signal<boolean>(false);
  private http = inject(HttpClient);

  constructor() { }

  getProducts() {
    this.loading.set(true);
    this.http.get<{ data: ProductInterface[] }>(this.apiUrl).pipe(
      takeUntilDestroyed(),
      catchError((error) => {
        console.log("Error al obtener los productos:", error);
        this.loading.set(false);
        return of({ data: [] });
      }
      )
    ).subscribe((resp) => {
      this.products.set(resp.data);
      this.loading.set(false);
    })
  }
}
