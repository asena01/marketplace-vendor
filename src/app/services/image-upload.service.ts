import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private uploadedImages: Map<string, string> = new Map();

  constructor() {
    console.log('✅ ImageUploadService initialized (using local storage mock)');
  }

  /**
   * Upload image - using data URL approach (no Firebase needed)
   * @param file Image file to upload
   * @param path Path in storage (e.g., 'products/product-id/image.jpg')
   * @returns Observable with data URL
   */
  uploadImage(file: File, path: string): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const uniqueKey = `${path}-${Date.now()}`;
        this.uploadedImages.set(uniqueKey, dataUrl);
        
        // Simulate network delay
        setTimeout(() => {
          console.log('✅ Image uploaded:', path);
          observer.next(dataUrl);
          observer.complete();
        }, 500);
      };

      reader.onerror = (error) => {
        console.error('❌ Image read error:', error);
        observer.error(error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Upload multiple images - using data URL approach
   * @param files Array of files to upload
   * @param folderPath Folder path in storage
   * @returns Observable with array of data URLs
   */
  uploadMultipleImages(files: File[], folderPath: string): Observable<string[]> {
    return new Observable((observer) => {
      const results: string[] = [];
      let completed = 0;

      if (files.length === 0) {
        observer.next([]);
        observer.complete();
        return;
      }

      files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          const uniqueKey = `${folderPath}/${Date.now()}-${index}-${file.name}`;
          this.uploadedImages.set(uniqueKey, dataUrl);
          
          results[index] = dataUrl;
          completed++;
          
          console.log(`✅ Image ${index + 1}/${files.length} uploaded: ${file.name}`);
          
          if (completed === files.length) {
            // Small delay to simulate network
            setTimeout(() => {
              observer.next(results);
              observer.complete();
            }, 300);
          }
        };

        reader.onerror = (error) => {
          console.error(`❌ Error reading file ${index}:`, error);
          observer.error(error);
        };

        reader.readAsDataURL(file);
      });
    });
  }

  /**
   * Create thumbnail image using Canvas API
   * @param file Original image file
   * @returns Promise with thumbnail data URL
   */
  async createThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const canvas = document.createElement('canvas');
        const img = new Image();
        
        img.onload = () => {
          const maxWidth = 200;
          const maxHeight = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const reader2 = new FileReader();
              reader2.onload = (e2) => {
                resolve(e2.target?.result as string);
              };
              reader2.readAsDataURL(blob);
            } else {
              resolve(e.target?.result as string);
            }
          }, 'image/jpeg', 0.8);
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        img.src = e.target?.result as string;
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete image from local storage
   * @param dataUrl Data URL of image to delete
   * @returns Observable<void>
   */
  deleteImage(dataUrl: string): Observable<void> {
    // Find and remove from map
    for (const [key, value] of this.uploadedImages.entries()) {
      if (value === dataUrl) {
        this.uploadedImages.delete(key);
        console.log('✅ Image deleted:', key);
      }
    }
    return of(void 0);
  }

  /**
   * Generate unique file path for storage
   * @param folder Folder name (e.g., 'products', 'restaurants')
   * @param id Entity ID
   * @param filename Original filename
   * @returns Generated path string
   */
  generateStoragePath(folder: string, id: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    return `${folder}/${id}/${timestamp}-${sanitizedName}`;
  }
}
