import { Component, input, signal } from '@angular/core';
import { UploadedFile } from '@code-zoom/shared-types';

@Component({
  selector: 'app-file-card',
  imports: [],
  templateUrl: './file-card.component.html',
  styleUrl: './file-card.component.css',
})
export class FileCardComponent {
  public cardFile = input<UploadedFile | null>(null);

  removeFile(filename: string) {}
}
