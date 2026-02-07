import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { Product, ProductFilter } from '../models/product.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private mockDataService: MockDataService) {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    const mockProducts = this.mockDataService.getMockProducts();
    this.productsSubject.next(mockProducts);
  }

  getProducts(): Observable<Product[]> {
    return this.products$.pipe(delay(500));
  }

  getProductById(id: string): Observable<Product> {
    return this.products$.pipe(
      map(products => {
        const product = products.find(p => p.id === id);
        if (!product) throw new Error(`Product with id ${id} not found`);
        return product;
      }),
      delay(300)
    );
  }

  createProduct(product: Product): Observable<Product> {
    const newProduct = {
      ...product,
      id: `p${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, newProduct]);
    return of(newProduct).pipe(delay(500));
  }

  updateProduct(id: string, updatedProduct: Partial<Product>): Observable<Product> {
    const currentProducts = this.productsSubject.value;
    const index = currentProducts.findIndex(p => p.id === id);
    if (index === -1) throw new Error(`Product with id ${id} not found`);

    const product = {
      ...currentProducts[index],
      ...updatedProduct,
      id,
      updatedAt: new Date()
    };

    const newProducts = [...currentProducts];
    newProducts[index] = product;
    this.productsSubject.next(newProducts);
    return of(product).pipe(delay(500));
  }

  deleteProduct(id: string): Observable<void> {
    const currentProducts = this.productsSubject.value;
    const filtered = currentProducts.filter(p => p.id !== id);
    this.productsSubject.next(filtered);
    return of(undefined).pipe(delay(300));
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        const lowerQuery = query.toLowerCase();
        return products.filter(p =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.description.toLowerCase().includes(lowerQuery)
        );
      }),
      delay(400)
    );
  }

  filterProducts(filter: ProductFilter): Observable<Product[]> {
    return this.products$.pipe(
      map(products => {
        let filtered = products;
        if (filter.search) {
          const lowerSearch = filter.search.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(lowerSearch) ||
            p.description.toLowerCase().includes(lowerSearch)
          );
        }
        if (filter.category) {
          filtered = filtered.filter(p => p.category === filter.category);
        }
        if (filter.status) {
          filtered = filtered.filter(p => p.status === filter.status);
        }
        if (filter.priceMin !== undefined) {
          filtered = filtered.filter(p => p.price >= filter.priceMin!);
        }
        if (filter.priceMax !== undefined) {
          filtered = filtered.filter(p => p.price <= filter.priceMax!);
        }
        return filtered;
      }),
      delay(400)
    );
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.products$.pipe(
      map(products => products.filter(p => p.category === category)),
      delay(400)
    );
  }

  getProductCount(): Observable<number> {
    return this.products$.pipe(
      map(products => products.length),
      delay(200)
    );
  }

  getTopRatedProducts(limit: number = 5): Observable<Product[]> {
    return this.products$.pipe(
      map(products =>
        products.sort((a, b) => b.rating - a.rating).slice(0, limit)
      ),
      delay(300)
    );
  }
}