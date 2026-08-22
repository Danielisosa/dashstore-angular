import { AfterViewInit, Component, ElementRef, input, OnChanges, SimpleChanges, viewChild } from '@angular/core';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules'
// import 'swiper/css';
// import 'swiper/css/navigation';
// import 'swiper/css/pagination';
import { ProductImagePipe } from "../../pipes/product-image.pipe";
import { ProductImageValue } from '@products/interfaces/product.interface';

@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.html',
  styleUrls: ['./product-carousel.css'],
})
export class ProductCarousel implements AfterViewInit, OnChanges {
  images = input<ProductImageValue[]>();
  swiperDiv=viewChild<ElementRef>('swiperDiv')

  swiper: Swiper | undefined = undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['images'].firstChange){
      return;
    }

    if(!this.swiper)return;

    this.swiper.destroy(true, true)

    const paginationEl: HTMLElement =
    this.swiperDiv()?.nativeElement?.querySelector('.swiper-pagination');
    if(paginationEl){
      paginationEl.innerHTML= '';
    }

    setTimeout(() => {
      this.swiperInit();
    }, 100);

  }

  ngAfterViewInit(): void {
    this.swiperInit();

  }
  swiperInit(){
    const element =this.swiperDiv()?.nativeElement;
    if(!element) return;

    this.swiper = new Swiper(element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,

      modules:[
         Navigation, Pagination
      ],

        // If we need pagination
      pagination: {
         el: '.swiper-pagination',
       },

        // Navigation arrows
      navigation: {
         nextEl: '.swiper-button-next',
         prevEl: '.swiper-button-prev',
      },

        // And if we need scrollbar
      scrollbar: {
         el: '.swiper-scrollbar',
      },
    });
  }



 }
