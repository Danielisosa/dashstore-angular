import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from "@angular/router";
import { AuthService } from '@auth/services/auth.service';
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from '@products/pipes/product-image.pipe';
import { CartService } from 'src/app/cart/services/Cart';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'front-nabvar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, ProductImagePipe],
  templateUrl: './front-nabvar.html',
  styleUrls: ['./front-nabvar.css'],
})
export class FrontNabvar {
  authService= inject(AuthService);
  private router = inject(Router);

  private cartService = inject(CartService);

  public totalItems = this.cartService.totalItems;
  public cartItems = this.cartService.cartItems; // <-- Para pintar la lista de productos
  public totalPrice = this.cartService.totalPrice;

  goToLogin(e?: Event){
    if(e) e.preventDefault();
    this.router.navigateByUrl('/auth/login').catch(()=>{ window.location.href = '/auth/login'; });
  }

 



}
