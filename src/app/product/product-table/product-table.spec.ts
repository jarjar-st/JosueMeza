import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductTable } from './product-table';
import { ProductService } from '../services/product';
import { ProductInterface } from '../interfaces/product.interface';
import { signal } from '@angular/core';
import { of } from 'rxjs';

describe('ProductTable', () => {
    let fixture: ComponentFixture<ProductTable>;
    let component: ProductTable;
    let productServiceSpy: jasmine.SpyObj<ProductService>;

    const mockProducts: ProductInterface[] = [
        { id: '1', name: 'Product A', description: 'Description A', logo: 'logoA.png', date_release: new Date('2022-01-01'), date_revision: new Date('2023-01-01') },
        { id: '2', name: 'Product B', description: 'Description B', logo: 'logoB.png', date_release: new Date('2022-06-01'), date_revision: new Date('2023-06-01') },
    ];

    beforeEach(() => {
        productServiceSpy = jasmine.createSpyObj<ProductService>('ProductService', [
            'getProducts', 'addProduct', 'editProduct', 'deleteProduct', 'idExistsVerification'
        ]);
        (productServiceSpy as any).products = signal<ProductInterface[]>(mockProducts);
        (productServiceSpy as any).loading = signal<boolean>(false);

        TestBed.configureTestingModule({
            imports: [ProductTable],
            providers: [
                { provide: ProductService, useValue: productServiceSpy }
            ]
        });

        fixture = TestBed.createComponent(ProductTable);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the component', () => {
        expect(component).toBeTruthy();
    });

    it('should call getProducts on init', () => {
        expect(productServiceSpy.getProducts).toHaveBeenCalled();
    });

    it('should filter products by name', () => {
        component.search.set('Product A');
        expect(component.filteredProducts().length).toBe(1);
        expect(component.filteredProducts()[0].name).toBe('Product A');
    });

    it('should paginate products', () => {
        component.pageSize.set(1);
        component.pageIndex.set(1);
        expect(component.paginatedProducts().length).toBe(1);
        expect(component.paginatedProducts()[0].id).toBe('2');
    });

    it('should open and close menu', () => {
        component.openMenu(mockProducts[0]);
        expect(component.menuOpen()).toBe('1');
        component.closeMenu();
        expect(component.menuOpen()).toBeNull();
    });

    it('should open add form and reset editProductData', () => {
        component.openAddForm();
        expect(component.formOpen()).toBeTrue();
        expect(component.editProductData()).toBeNull();
    });

    it('should open edit form with product data', () => {
        component.editProduct(mockProducts[1]);
        expect(component.formOpen()).toBeTrue();
        expect(component.editProductData()).toEqual(mockProducts[1]);
    });

    it('should open and close delete modal', () => {
        component.deleteProduct(mockProducts[0]);
        expect(component.deleteModalOpen()).toBeTrue();
        expect(component.deleteProductData()).toEqual(mockProducts[0]);
        component.closeDeleteModal();
        expect(component.deleteModalOpen()).toBeFalse();
        expect(component.deleteProductData()).toBeNull();
    });

    it('should call deleteProduct and refresh products on confirmDeleteProduct', () => {
        productServiceSpy.deleteProduct.and.returnValue(of({}));
        productServiceSpy.getProducts.calls.reset();
        component.deleteProduct(mockProducts[0]);
        component.confirmDeleteProduct();
        expect(productServiceSpy.deleteProduct).toHaveBeenCalledWith(mockProducts[0]);
        expect(productServiceSpy.getProducts).toHaveBeenCalled();
        expect(component.deleteModalOpen()).toBeFalse();
    });



    it('should call editProduct on form submit for existing product', () => {
        productServiceSpy.editProduct.and.returnValue(of({
            message: 'Product updated successfully',
            data: mockProducts[1]
        }));
        component.editProductData.set(mockProducts[1]);
        component.onFormSubmit(mockProducts[1]);
        expect(productServiceSpy.editProduct).toHaveBeenCalledWith(mockProducts[1]);
        expect(productServiceSpy.getProducts).toHaveBeenCalled();
        expect(component.formOpen()).toBeFalse();
    });
});