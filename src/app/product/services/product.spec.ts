import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product';
import { ApiResponse, ProductInterface } from '../interfaces/product.interface';
import { provideHttpClient } from '@angular/common/http';

describe('ProductService (Angular 20)', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: ProductInterface[] = [
    { id: '1', name: 'A', description: 'A desc', logo: 'logoA', date_release: new Date('2022-01-01'), date_revision: new Date('2023-01-01') },
    { id: '2', name: 'B', description: 'B desc', logo: 'logoB', date_release: new Date('2022-06-01'), date_revision: new Date('2023-06-01') },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  describe('#getProducts', () => {
    it('should fetch products, set signal and toggle loading', () => {
      service.getProducts();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne('/bp/products');
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProducts });

      expect(service.products()).toEqual(mockProducts);
      expect(service.loading()).toBe(false);
    });

    it('should handle error and set products to empty', () => {
      service.getProducts();
      expect(service.loading()).toBe(true);

      const req = httpMock.expectOne('/bp/products');
      req.error(new ErrorEvent('Network error'));

      expect(service.products()).toEqual([]);
      expect(service.loading()).toBe(false);
    });
  });

  describe('#idExistsVerification', () => {
    it('should return false when API says false', () => {
      service.idExistsVerification('xyz').subscribe(res => expect(res).toBe(false));

      const req = httpMock.expectOne('/bp/products/verification/xyz');
      expect(req.request.method).toBe('GET');
      req.flush(false);
    });

    it('should return true by default on error', () => {
      service.idExistsVerification('err').subscribe(res => expect(res).toBe(true));

      const req = httpMock.expectOne('/bp/products/verification/err');
      req.error(new ErrorEvent('Server error'));
    });
  });

  describe('#addProduct', () => {
    it('should POST new product and clear loading', fakeAsync(() => {
      const newProd: ProductInterface = {
        id: '3', name: 'C', description: 'descC',
        logo: 'logoC', date_release: new Date(), date_revision: new Date()
      };

      let response: any = null;

      service.addProduct(newProd).subscribe(res => {
        response = res;
      });

      const req = httpMock.expectOne('/bp/products');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newProd);
      req.flush(newProd);

      tick();  

      expect(response).toEqual(newProd);
      expect(service.loading()).toBe(false);
    }));

    it('should return null and clear loading on error', fakeAsync(() => {
      const newProd: ProductInterface = { id: '4', name: 'D', description: '', logo: '', date_release: new Date(), date_revision: new Date() };

      let response: ApiResponse<ProductInterface> | null = null;

      service.addProduct(newProd).subscribe(res => {
        response = res;
      });

      const req = httpMock.expectOne('/bp/products');
      req.error(new ErrorEvent('Add error'));

      tick();

      expect(response).toBeNull();
      expect(service.loading()).toBe(false);
    }));
  });

  describe('#editProduct', () => {
    it('should PUT updated product and clear loading', fakeAsync(() => {
      const upd: ProductInterface = {
        id: '2',
        name: 'B-upd',
        description: 'desc',
        logo: 'logo',
        date_release: new Date(),
        date_revision: new Date()
      };

      let response: any = null;

      service.editProduct(upd).subscribe(res => {
        response = res;
      });

      const req = httpMock.expectOne(`/bp/products/${upd.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush(upd);

      tick();

      expect(response).toEqual(upd);
      expect(service.loading()).toBe(false);
    }));


    it('should return null and clear loading on error', () => {
      const upd: ProductInterface = { id: '99', name: 'X', description: '', logo: '', date_release: new Date(), date_revision: new Date() };
      service.editProduct(upd).subscribe(res => {
        expect(res).toBeNull();
        expect(service.loading()).toBe(false);
      });
      const req = httpMock.expectOne(`/bp/products/${upd.id}`);
      req.error(new ErrorEvent('Edit error'));
    });
  });

  describe('#deleteProduct', () => {
    it('should DELETE product and clear loading', fakeAsync(() => {
      const prod: ProductInterface = mockProducts[0];

      let response: any = undefined;

      service.deleteProduct(prod).subscribe(res => {
        response = res;
      });

      const req = httpMock.expectOne(`/bp/products/${prod.id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      tick();

      expect(response).toBeNull();
      expect(service.loading()).toBe(false);
    }));

    it('should return null and clear loading on error', fakeAsync(() => {
      const prod: ProductInterface = mockProducts[1];

      let response: any = undefined;

      service.deleteProduct(prod).subscribe(res => {
        response = res;
      });

      const req = httpMock.expectOne(`/bp/products/${prod.id}`);
      req.error(new ErrorEvent('Delete error'));

      tick();

      expect(response).toBeNull();
      expect(service.loading()).toBe(false);
    }));
  });
});
