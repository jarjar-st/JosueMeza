import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductTable } from "./product/product-table/product-table";

@Component({
  selector: 'app-root',
  imports: [ProductTable],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('JosueMeza');
}
