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
    return 'https://yellow-water-00b488b0f-dev.eastus2.7.azurestaticapps.net'; //window.location.origin;
  }

  getImageUrl(imagePath: string): string {
    return `${this.baseUrl}/${imagePath}`;
  }
}
