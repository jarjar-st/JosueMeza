import { Routes } from '@angular/router';
import { ProductTable } from './product/product-table/product-table';
import { ProductForm } from './product/product-form/product-form';

export const routes: Routes = [
    {
        path: '',
        component: ProductTable,
    },
    {
        path: 'add-product',
        component: ProductForm
    },
];
