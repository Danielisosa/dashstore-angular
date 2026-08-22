import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { CartService } from '../../services/Cart';

@Component({
  selector: 'cart-view',
  imports: [CommonModule, RouterLink, ProductImagePipe],
  templateUrl: './cart-view.html',
  styleUrl: './cart-view.css',
})
export class CartView implements OnInit {
  readonly cartService = inject(CartService);

  ngOnInit(): void {

    if (!this.cartService.cart()) {
      this.cartService.loadCart();
    }
  }
}
