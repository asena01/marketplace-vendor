import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUploadService {
  // Local backend API endpoint (replacing Firebase Storage)
  private apiUrl = 'http://localhost:5001/api/upload';
  //private apiUrl = 'https://api-qpczzmaezq-uc.a.run.app/api/upload';
  constructor(private http: HttpClient) {
    console.log('🔄 FirebaseUploadService initialized with local API endpoint:', this.apiUrl);
  }

  /**
   * Upload image to local backend
   * ⚠️ REPLACED: Previously used Firebase Storage SDK
   * @param file - Image file to upload
   * @param path - Path/folder type for storage (e.g., 'products', 'vendor-profiles', 'vendor-banners')
   * @returns Promise with download URL from local backend
   */
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Use the path as folder type for local storage organization
      const folderType = path.split('/')[0] || 'products';

      return new Promise((resolve, reject) => {
        this.http.post<{ success: boolean; url: string; path: string }>(
          `${this.apiUrl}/single/${folderType}`,
          formData
        ).subscribe({
          next: (response) => {
            if (response.success) {
              // Convert relative URL to absolute if needed
              const imageUrl = response.url.startsWith('http')
                ? response.url
                : `http://localhost:5001${response.url}`;
              console.log('✅ Image uploaded successfully to local backend:', imageUrl);
              resolve(imageUrl);
            } else {
              reject(new Error('Upload failed'));
            }
          },
          error: (error) => {
            console.error('❌ Error uploading image to local backend:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to local backend
   * ⚠️ REPLACED: Previously used Firebase Storage SDK batch upload
   * @param files - Array of files to upload
   * @param basePath - Base folder path for all files
   * @returns Promise with array of download URLs
   */
  async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('images', file);
      });

      // Use the basePath as folder type
      const folderType = basePath.split('/')[0] || 'products';

      return new Promise((resolve, reject) => {
        this.http.post<{ success: boolean; urls: string[] }>(
          `${this.apiUrl}/multiple/${folderType}`,
          formData
        ).subscribe({
          next: (response) => {
            if (response.success) {
              // Convert relative URLs to absolute if needed
              const absoluteUrls = response.urls.map((url: string) =>
                url.startsWith('http') ? url : `http://localhost:5001${url}`
              );
              console.log('✅ All images uploaded successfully to local backend');
              resolve(absoluteUrls);
            } else {
              reject(new Error('Batch upload failed'));
            }
          },
          error: (error) => {
            console.error('❌ Error uploading multiple images to local backend:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error uploading multiple images:', error);
      throw error;
    }
  }

  /**
   * Delete image from local backend
   * ⚠️ REPLACED: Previously used Firebase Storage SDK deleteObject
   * @param url - Download URL of the image
   */
  async deleteImage(url: string): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        this.http.post<{ success: boolean }>(
          `${this.apiUrl}/delete-by-url`,
          { url }
        ).subscribe({
          next: (response) => {
            if (response.success) {
              console.log('✅ Image deleted successfully from local backend');
              resolve();
            } else {
              reject(new Error('Delete failed'));
            }
          },
          error: (error) => {
            console.error('❌ Error deleting image from local backend:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }
}
