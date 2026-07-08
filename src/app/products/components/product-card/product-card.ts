
import { CommonModule } from '@angular/common';
import { Component, input, computed } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '@products/interfaces/product.interface';
import { ProductImagePipe } from "../../pipes/product-image.pipe";

@Component({
  standalone: true,
  selector: 'product-card',
  imports: [CommonModule, RouterLink,  ProductImagePipe],
  templateUrl: './product-card.html',
  styleUrls: ['./product-card.css'],
})
export class ProductCard {
  product = input<Product>();
  cardProduct = computed(() => this.product());
 }
