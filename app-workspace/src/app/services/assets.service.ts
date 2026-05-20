import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AssetsService {
  private get baseUrl(): string {
    // Use localhost for development, Azure URL for production
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:4203';
    }
    return window.location.origin;
  }

  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}/${imagePath}`;
  }
}
