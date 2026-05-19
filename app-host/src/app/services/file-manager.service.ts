import { Injectable, signal } from '@angular/core';
import { UploadedFile } from '../shared/interfaces/interfaces';

@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  files = signal<UploadedFile[]>([]);

  appendFile(file: UploadedFile): void {
    this.files.update((f) => [...f, file]);
  }

  removeFile(fileName: string): void {
    this.files.update((f) => f.filter((file) => file.name !== fileName));
  }

  async uploadFiles(files: File[]): Promise<void> {
    try {
      files.forEach((file) => {
        this.readFileContent(file).then((content) => {
          const fileExists = this.files().some((f) => f.name === file.name);
          const extension = file.name.split('.').pop()?.toUpperCase();

          if (!fileExists) {
            const uploadedFile: UploadedFile = {
              name: file.name,
              content,
              size: file.size,
              extension,
            };
            this.appendFile(uploadedFile);
          }
        });
      });
    } catch (error) {
      alert(`Failed to upload: ${(error as Error).message}`);
    }
  }

  private readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create FileReader instance to read file content
      const reader = new FileReader();
      // Set up success handler - resolve promise with file content
      reader.onload = () => resolve(reader.result as string);
      // Set up error handler - reject promise with reader error
      reader.onerror = () => reject(reader.error);
      // Start reading the file as text content
      reader.readAsText(file);
    });
  }

  async readFilesFromURLs(addresses: string[]): Promise<void> {
    try {
      while (addresses.length > 0) {
        const url = addresses.shift() as string;
        if (url.trim() === '') continue;
        // Make an HTTP GET request to the provided URL
        const response = await fetch(url);

        // Check if the request was successful
        if (response.ok) {
          // Read the response body as text
          const content = await response.text();

          const filename = url.split('/').pop() || 'file.txt';
          const filesize = Number(response.headers.get('content-length')) || 0;
          const uploadedFile: UploadedFile = {
            name: filename,
            content,
            size: filesize,
          };

          this.appendFile(uploadedFile);
        }
      }
    } catch (error) {
      throw new Error(`Failed to read file from URL: ${(error as Error).message}`);
    }
  }
}
