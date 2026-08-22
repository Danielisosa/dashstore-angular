import { Pipe, PipeTransform } from '@angular/core';
import { ProductImageItem, ProductImageValue } from '@products/interfaces/product.interface';
import { environment } from 'src/environments/environment';

const baseUrl = environment.baseUrl;
const fallbackImage = '/assets/images/no-image.jpg';

@Pipe({
  name: 'productImage'
})
export class ProductImagePipe implements PipeTransform {
  transform(value: null | undefined | ProductImageValue | ProductImageValue[]): string {
    const rawValues = Array.isArray(value)
      ? value
      : value !== null && value !== undefined
        ? [value]
        : [];

    const image = rawValues
      .map(item => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object' && typeof item.url === 'string') return item.url.trim();
        return '';
      })
      .find(item => !!item);

    if (!image) {
      return fallbackImage;
    }

    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:') || image.startsWith('blob:')) {
      return image;
    }

    if (image.startsWith('/')) {
      return image;
    }

    if (image.startsWith('assets/')) {
      return `/${image}`;
    }

    if (image.includes('/files/product/') || image.includes('/uploads/') || image.includes('/images/')) {
      return image.startsWith('/') ? image : `/${image}`;
    }

    return `${baseUrl}/files/product/${image}`;
  }
}
