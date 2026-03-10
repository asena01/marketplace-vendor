import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, UploadMetadata } from 'firebase/storage';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AngularFireUploadService {
  private storage = getStorage(getApp());

  constructor() {
    console.log('✅ AngularFireUploadService initialized with Firebase Storage');
  }

  /**
   * Upload a single image to Firebase Storage
   * @param file - Image file to upload
   * @param path - Storage path (e.g., 'products/product-id/image.jpg')
   * @returns Observable with download URL
   */
  uploadImage(file: File, path: string): Observable<string> {
    return from(
      (async () => {
        try {
          // Generate unique filename to avoid overwrites
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.name}`;
          const storagePath = `${path}/${filename}`.replace(/\/+/g, '/');
          
          const storageRef = ref(this.storage, storagePath);
          const metadata: UploadMetadata = {
            contentType: file.type || 'image/jpeg',
            customMetadata: {
              uploadedAt: new Date().toISOString()
            }
          };

          console.log(`📤 Uploading image to: ${storagePath}`);
          await uploadBytes(storageRef, file, metadata);
          
          const downloadUrl = await getDownloadURL(storageRef);
          console.log(`✅ Image uploaded successfully: ${downloadUrl}`);
          
          return downloadUrl;
        } catch (error) {
          console.error('❌ Error uploading image:', error);
          throw error;
        }
      })()
    ).pipe(
      catchError(error => {
        console.error('❌ Firebase upload error:', error);
        return throwError(() => new Error(`Failed to upload image: ${error.message}`));
      })
    );
  }

  /**
   * Upload multiple images to Firebase Storage
   * @param files - Array of image files to upload
   * @param basePath - Base storage path for all files
   * @returns Observable with array of download URLs
   */
  uploadMultipleImages(files: File[], basePath: string): Observable<string[]> {
    return from(
      (async () => {
        try {
          const downloadUrls: string[] = [];
          
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const timestamp = Date.now();
            const filename = `${timestamp}-${i}-${file.name}`;
            const storagePath = `${basePath}/${filename}`.replace(/\/+/g, '/');
            
            const storageRef = ref(this.storage, storagePath);
            const metadata: UploadMetadata = {
              contentType: file.type || 'image/jpeg',
              customMetadata: {
                uploadedAt: new Date().toISOString(),
                index: i.toString()
              }
            };

            console.log(`📤 Uploading image ${i + 1}/${files.length}: ${storagePath}`);
            await uploadBytes(storageRef, file, metadata);
            
            const downloadUrl = await getDownloadURL(storageRef);
            downloadUrls.push(downloadUrl);
            console.log(`✅ Image ${i + 1}/${files.length} uploaded successfully`);
          }
          
          console.log(`✅ All ${files.length} images uploaded successfully`);
          return downloadUrls;
        } catch (error) {
          console.error('❌ Error uploading multiple images:', error);
          throw error;
        }
      })()
    ).pipe(
      catchError(error => {
        console.error('❌ Firebase batch upload error:', error);
        return throwError(() => new Error(`Failed to upload images: ${error.message}`));
      })
    );
  }

  /**
   * Delete an image from Firebase Storage
   * @param downloadUrl - The download URL of the image to delete
   * @returns Observable<void>
   */
  deleteImage(downloadUrl: string): Observable<void> {
    return from(
      (async () => {
        try {
          // Extract the file path from the download URL
          // Download URLs have format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?...
          const decoded = decodeURIComponent(downloadUrl);
          const match = decoded.match(/\/o\/([^?]+)\?/);
          
          if (!match || !match[1]) {
            throw new Error('Invalid download URL format');
          }
          
          const filePath = match[1];
          const storageRef = ref(this.storage, filePath);
          
          console.log(`🗑️ Deleting image from: ${filePath}`);
          await deleteObject(storageRef);
          
          console.log(`✅ Image deleted successfully`);
        } catch (error) {
          console.error('❌ Error deleting image:', error);
          throw error;
        }
      })()
    ).pipe(
      catchError(error => {
        console.error('❌ Firebase delete error:', error);
        return throwError(() => new Error(`Failed to delete image: ${error.message}`));
      })
    );
  }

  /**
   * Generate a unique storage path for a file
   * @param folder - Folder name (e.g., 'products', 'menu-items')
   * @param id - Entity ID
   * @param filename - Original filename
   * @returns Generated path string
   */
  generateStoragePath(folder: string, id: string, filename: string): string {
    const timestamp = Date.now();
    const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '-').toLowerCase();
    return `${folder}/${id}/${timestamp}-${sanitizedName}`;
  }
}
