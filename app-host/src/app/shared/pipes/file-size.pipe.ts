import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(sizeInBytes: number | undefined): string {
    if (!sizeInBytes || sizeInBytes === 0) {
      return '0 B';
    }

    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      const sizeInKB = (sizeInBytes / 1024).toFixed(2);
      return `${sizeInKB} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
      return `${sizeInMB} MB`;
    } else {
      const sizeInGB = (sizeInBytes / (1024 * 1024 * 1024)).toFixed(2);
      return `${sizeInGB} GB`;
    }
  }
}
