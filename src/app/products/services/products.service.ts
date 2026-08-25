import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '@auth/interfaces/user.interface';
import { Gender, Product, ProductsResponse } from '@products/interfaces/product.interface';
import { forkJoin, map, Observable, of, switchMap, tap, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const baseUrl= environment.baseUrl;

interface Options{
  limit?: number;
  offset?: number;
  gender?: string;
  search?: string;
}

const emptyProduct: Product = {
  id: 'new',
  title: '',
  price: 0,
  description: '',
  slug: '',
  stock: 0,
  sizes: [],
  gender: Gender.Men,
  tags: [],
  images: [],
  user: {} as User
}

@Injectable({providedIn:'root'})

export class ProductsService {
  private http = inject(HttpClient);

  private productsCache = new Map<string, ProductsResponse>();

  private productCache = new Map<string, Product>();


  getProducts(options: Options):Observable<ProductsResponse>{

    const { limit= 9, offset= 0, gender= '', search = ''}= options;

    const key= `${limit}-${offset}-${gender}-${search}`;
    if(this.productsCache.has(key)){
      return of(this.productsCache.get(key)!);
    }

    const tryParamNames = (names: string[]): Observable<ProductsResponse> => {
      const paramName = names[0];
      const params: any = { limit, offset, gender };
      if (search) params[paramName] = search;

      return this.http.get<ProductsResponse>(`${baseUrl}/products`, { params }).pipe(
        tap((resp) => console.log(resp)),
        tap((resp) => this.productsCache.set(key, resp)),
        catchError((err) => {
          const msg = err?.error?.message ? String(err.error.message) : '';
          if (names.length > 1 && (err?.status === 400 || msg.includes('should not exist'))) {
            // Try next possible param name
            return tryParamNames(names.slice(1));
          }
          return throwError(() => err);
        })
      );
    };

    return tryParamNames(['search', 'q', 'query', 'title']);

  }

  getProductByIdSlug(idSlug: string): Observable<Product>{
    if(this.productCache.has(idSlug)){
      return of(this.productCache.get(idSlug)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${idSlug}`)
    .pipe(tap((product)=> this.productCache.set(idSlug, product)));
  }


  getProductById(id: string): Observable<Product>{

    if(id === 'new'){
      return of(emptyProduct);
    }

    if(this.productCache.has(id)){
      return of(this.productCache.get(id)!);
    }

    return this.http.get<Product>(`${baseUrl}/products/${id}`)
    .pipe(tap((product)=> this.productCache.set(id, product)));
  }

  updateProduct(
    id: string,
    productLike: Partial<Product>,
    imageFileList?: FileList
  ): Observable<Product>{

      const currentImages= productLike.images ?? [];

      return this.uploadImages(imageFileList)
      .pipe(
        map((imageNames) => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })),
        switchMap((updateProduct)=>
        this.http.patch<Product>(`${baseUrl}/products/${id}`, updateProduct)),
        (tap((product)=> this.updateProductCache(product))
        )
      )

  }
  createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Product>{
      const currentImages= productLike.images ?? [];

      return this.uploadImages(imageFileList)
      .pipe(
        map((imageNames) => ({
          ...productLike,
          images: [...currentImages, ...imageNames]
        })),
        switchMap((product)=>
        this.http.post<Product>(`${baseUrl}/products`, product)),
        (tap((product)=> this.productCache.set(product.id, product))
        )
      )

  }

  updateProductCache(product: Product){
    const productId= product.id;
    this.productCache.set(productId, product);

    this.productsCache.forEach( (productsResponse) => {
      productsResponse.products= productsResponse.products.map(
        (currentProduct) => {
          return currentProduct.id === productId ? product : currentProduct;
        }
      )
    })
  }

  uploadImages(images?: FileList): Observable<string[]>{
    if(!images) return of([]);

    const uploadObservables= Array.from(images).map((image) => this.uploadImage(image));

    return forkJoin(uploadObservables).pipe(tap((imageNames) => console.log('imagenes subidas', imageNames)));
  }

  uploadImage(imageFile: File): Observable<string>{
    const formData= new FormData();
    formData.append('file', imageFile);

    return this.http.post<{fileName: string}>(`${baseUrl}/files/product`, formData)
    .pipe(map((resp)=> resp.fileName));
  }
}


