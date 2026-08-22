import { ProductsService } from '@products/services/products.service';
import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductCarousel } from "@products/components/product-carousel/product-carousel";
import { CartService } from 'src/app/cart/services/Cart';
import { Product } from '@products/interfaces/product.interface';

@Component({
  selector: 'app-product-page',
  imports: [CommonModule, ProductCarousel],
  templateUrl: './product-page.html',
  styleUrls: ['./product-page.css'],
})
export class ProductPage {
  activatedRoute= inject(ActivatedRoute);
  productService= inject(ProductsService)

  productIdSlug = this.activatedRoute.snapshot.params['idSlug'];

  public product = input.required<Product>();
  // Inyectamos nuestro servicio del carrito
  private cartService = inject(CartService);




  productResource= rxResource({
    request: () => ({idSlug: this.productIdSlug}),
    loader: ({request})=> {
      return this.productService.getProductByIdSlug(request.idSlug)
    }
  })

  onAddToCart(event: Event): void {
    event.stopPropagation();

    // 1. Obtenemos el producto actual que cargó el rxResource
    const productData = this.productResource.value();

    // 2. Nos aseguramos de que los datos ya existan antes de enviarlos
    if (!productData) {
      console.warn('El producto aún no se ha cargado por completo.');
      return;
    }

    // 3. Enviamos el ID real al servicio del carrito
    console.log('Agregando producto con ID:', productData.id); // Un log de apoyo para ti
    this.cartService.addToCart(productData.id);
  }
}
