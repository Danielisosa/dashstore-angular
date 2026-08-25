import { PaginationService } from './../../../shared/components/pagination/pagination.service';
import { Component, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '@products/components/product-card/product-card';
import { ProductsService } from '@products/services/products.service';
import { Pagination } from "@shared/components/pagination/pagination";
import { map } from 'rxjs';


@Component({
  selector: 'app-home-page',
  imports: [ProductCard, Pagination],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService)
  private route = inject(ActivatedRoute);
  private searchSignal = toSignal(this.route.queryParamMap.pipe(map(m => m.get('search') || '')));

  productsResource= rxResource({
    request: () =>({ page: this.paginationService.currentPage()-1, search: this.searchSignal() }),
    loader: ({ request })=>
      {
      return this.productsService.getProducts({
        offset: request.page*9,
        search: request.search
      });
    }
  });
 }
