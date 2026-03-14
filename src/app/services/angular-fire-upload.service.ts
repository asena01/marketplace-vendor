import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AngularFireUploadService {
  private apiUrl = 'http://localhost:5001/api/upload';
  private http = inject(HttpClient);

  constructor() {
    console.log('✅ AngularFireUploadService initialized with Backend Upload');
  }

  /**
   * Upload a single image to backend
   * @param file - Image file to upload
   * @param folder - Folder name (e.g., 'products' or 'products/vendorId/productId')
   * @returns Observable with the download URL
   */
  uploadImage(file: File, folder: string): Observable<string> {
    const formData = new FormData();
    formData.append('image', file);

    // Extract the first part of the folder path (e.g., 'products' from 'products/vendorId/productId')
    const folderName = folder.split('/')[0] || 'products';

    console.log(`📤 Uploading: ${file.name} to folder: ${folder}`);
    console.log(`📤 Backend endpoint: ${this.apiUrl}/single/${folderName}`);

    return this.http.post<{success: boolean, url: string}>(
      `${this.apiUrl}/single/${folderName}`,
      formData
    ).pipe(
      map((response: any) => {
        if (response.success && response.url) {
          console.log(`🔗 Upload successful for ${file.name}: ${response.url}`);
          return response.url;
        } else {
          throw new Error(`Failed to upload ${file.name}: ${response.message}`);
        }
      })
    );
  }

  /**
   * Upload multiple images to backend
   * @param files - Array of image files to upload
   * @param folderPath - Folder name for storage (e.g., 'products' or 'products/vendorId/productId')
   * @returns Observable with an array of download URLs
   */
  uploadMultipleImages(files: File[], folderPath: string): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    // Extract the first part of the folder path (e.g., 'products' from 'products/vendorId/productId')
    const folderName = folderPath.split('/')[0] || 'products';

    console.log(`📤 Starting upload of ${files.length} file(s) to folder: ${folderPath}`);
    console.log(`📤 Backend endpoint: ${this.apiUrl}/multiple/${folderName}`);

    return this.http.post<{success: boolean, urls: string[]}>(
      `${this.apiUrl}/multiple/${folderName}`,
      formData
    ).pipe(
      map((response: any) => {
        if (response.success && response.urls && response.urls.length > 0) {
          console.log(`✅ All files uploaded successfully! Count: ${response.urls.length}`);
          console.log(`📸 URLs:`, response.urls);
          return response.urls;
        } else {
          throw new Error(`Failed to upload images: ${response.message}`);
        }
      })
    );
  }

  /**
   * Delete an image from backend
   * @param downloadUrl - The download URL of the image to delete
   * @returns Observable<void>
   */
  deleteImage(downloadUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        console.log(`🗑️ Deleting: ${downloadUrl}`);

        this.http.post(`${this.apiUrl}/delete-by-url`, { url: downloadUrl })
          .subscribe({
            next: (response: any) => {
              if (response.success) {
                console.log(`✅ Deleted successfully`);
                resolve();
              } else {
                reject(new Error(response.message || 'Failed to delete image'));
              }
            },
            error: (error: any) => {
              console.error(`❌ Failed to delete:`, error.message);
              reject(error);
            }
          });
      } catch (error: any) {
        console.error(`❌ Error during deletion:`, error.message);
        reject(error);
      }
    });
  }
}
