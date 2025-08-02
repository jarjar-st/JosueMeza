import { Component, inject } from '@angular/core';
import { ProductService } from '../services/product';

@Component({
  selector: 'app-product-table',
  imports: [],
  templateUrl: './product-table.html',
  styleUrl: './product-table.css'
})
export class ProductTable {
  productService = inject(ProductService);
  constructor() {
    this.productService.getProducts();
  }

}
