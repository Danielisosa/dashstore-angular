
import { CommonModule } from '@angular/common';
import { Component, input, computed, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from "../../pipes/product-image.pipe";
import { CartService } from 'src/app/cart/services/Cart';

@Component({
  standalone: true,
  selector: 'product-card',
  imports: [CommonModule, RouterLink,  ProductImagePipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCard {
  product = input.required<Product>();
  cardProduct = computed(() => this.product());

  private cartService = inject(CartService);

  /**
   * Método que se activará al hacer clic en el botón de la tarjeta
   */
  onAddToCart(event: Event): void {

    event.stopPropagation();


    this.cartService.addToCart(this.product().id);
  }
 }
