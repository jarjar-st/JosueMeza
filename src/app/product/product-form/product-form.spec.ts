import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductForm } from './product-form';
import { ProductService } from '../services/product';
import { ProductInterface } from '../interfaces/product.interface';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ProductForm Component', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;
  let mockProductService: jasmine.SpyObj<ProductService>;

  const sampleProduct: ProductInterface = {
    id: '123',
    name: 'Producto',
    description: 'Un producto de prueba.',
    logo: 'logo.png',
    date_release: new Date('2025-01-01'),
    date_revision: new Date('2026-01-01'),
  };

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('ProductService', ['idExistsVerification']);
    mockProductService.idExistsVerification.and.returnValue(of(false));

    await TestBed.configureTestingModule({
      imports: [ProductForm],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar los valores del producto si se pasa uno como input', () => {
    component.product = sampleProduct;
    component.ngOnChanges({
      product: {
        currentValue: sampleProduct,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    expect(component.isEdit()).toBeTrue();
    expect(component.id()).toBe('123');
    expect(component.name()).toBe('Producto');
  });


  // it('should emit submit event with valid product', () => {
  //   const emitSpy = spyOn(component.submit, 'emit');

  //   // Crear fechas válidas dinámicamente
  //   const today = new Date();
  //   const nextYear = new Date(today);
  //   nextYear.setFullYear(today.getFullYear() + 1);

  //   // Establecer valores válidos en el formulario
  //   component.name.set('Producto'); // 8 caracteres, válido
  //   component.description.set('Un producto de prueba.'); // válido
  //   component.logo.set('http://logo.com/logo.png'); // válido
  //   component.date_release.set(today); // hoy
  //   component.date_revision.set(nextYear); // un año después

  //   // Detectar cambios en el formulario
  //   fixture.detectChanges();

  //   // Enviar formulario
  //   component.onSubmit();

  //   // Asegurarse de que emit se haya llamado
  //   expect(emitSpy).toHaveBeenCalled();

  //   // Obtener el objeto emitido
  //   const lastCall = emitSpy.calls.mostRecent();
  //   expect(lastCall).toBeDefined();

  //   const emittedProduct = lastCall.args[0] as ProductInterface;

  //   expect(emittedProduct.name).toBe('Producto');
  //   expect(emittedProduct.description).toBe('Un producto de prueba.');
  //   expect(emittedProduct.logo).toBe('http://logo.com/logo.png');
  //   expect(new Date(emittedProduct.date_release)).toEqual(today);
  //   expect(new Date(emittedProduct.date_revision)).toEqual(nextYear);
  // });


  it('debería emitir evento close al cerrar', () => {
    const closeSpy = spyOn(component.close, 'emit');
    component.onClose();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('debería validar correctamente un formulario inválido', () => {
    component.id.set('');
    component.name.set('');
    component.description.set('');
    component.logo.set('');
    component.date_release.set(new Date('2020-01-01')); // fecha pasada
    component.date_revision.set(new Date('2023-01-01'));

    const result = component.validateForm();
    expect(result).toBeFalse();
    const errors = component.erros();
    expect(Object.keys(errors).length).toBeGreaterThan(0);
    expect(errors['id']).toBeDefined();
    expect(errors['name']).toBeDefined();
    expect(errors['date_release']).toContain('futura');
  });

  it('debería actualizar date_revision automáticamente al cambiar date_release', () => {
    const newDate = new Date('2030-01-01T00:00:00Z'); // especificar en UTC
    const fakeInputEvent = {
      target: { value: '2030-01-01' }
    } as unknown as Event;

    component.fillDateRelease(fakeInputEvent);

    const releaseYear = component.date_release().getUTCFullYear();
    const revisionYear = component.date_revision().getUTCFullYear();

    expect(revisionYear).toBe(releaseYear + 1);
  });

  it('debería llamar al servicio para verificar si el ID existe', () => {
    component.id.set('ABC123');
    component.checkId();
    expect(mockProductService.idExistsVerification).toHaveBeenCalledWith('ABC123');
  });

  it('debería resetear el formulario al cerrar', () => {
    component.isEdit.set(false);
    component.id.set('old');
    component.name.set('old name');
    component.resetForm();
    expect(component.id()).toBe('');
    expect(component.name()).toBe('');
  });

  it('debería cerrar modal si se hace clic en el backdrop', () => {
    const closeSpy = spyOn(component, 'onClose');
    const fakeClick = {
      target: {
        classList: {
          contains: (className: string) => className === 'modal-backdrop'
        }
      }
    } as unknown as MouseEvent;

    component.onBackdropClick(fakeClick);
    expect(closeSpy).toHaveBeenCalled();
  });

});
