import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: 'AIzaSyDZAc9Z5VZnJ3o5p5k5k5k5k5k5k5k5k5',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abc123def456'
};

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private storage: any;

  constructor() {
    try {
      const app = initializeApp(firebaseConfig);
      this.storage = getStorage(app);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  /**
   * Upload image to Firebase Storage
   * @param file Image file to upload
   * @param path Path in storage (e.g., 'products/product-id/image.jpg')
   * @returns Observable with download URL
   */
  uploadImage(file: File, path: string): Observable<string> {
    const storageRef = ref(this.storage, path);
    
    return from(
      uploadBytes(storageRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
    ).pipe(
      catchError((error) => {
        console.error('Image upload error:', error);
        throw error;
      })
    );
  }

  /**
   * Upload multiple images
   * @param files Array of files to upload
   * @param folderPath Folder path in storage
   * @returns Observable with array of download URLs
   */
  uploadMultipleImages(files: File[], folderPath: string): Observable<string[]> {
    const uploadPromises = files.map((file, index) => {
      const path = `${folderPath}/${Date.now()}-${index}-${file.name}`;
      const storageRef = ref(this.storage, path);
      return uploadBytes(storageRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      });
    });

    return from(Promise.all(uploadPromises)).pipe(
      catchError((error) => {
        console.error('Multiple images upload error:', error);
        throw error;
      })
    );
  }

  /**
   * Create thumbnail image (placeholder for now)
   * In production, use image processing library like sharp
   * @param file Original image file
   * @returns Promise with thumbnail data
   */
  async createThumbnail(file: File): Promise<Blob> {
    // For now, return the original file
    // In production, use Canvas API or image processing library
    return new Promise((resolve) => {
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
            resolve(blob || file);
          }, 'image/jpeg', 0.8);
        };
        
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Delete image from Firebase Storage
   * @param path Path to image in storage
   * @returns Observable<void>
   */
  deleteImage(path: string): Observable<void> {
    const storageRef = ref(this.storage, path);
    return from(deleteObject(storageRef)).pipe(
      catchError((error) => {
        console.error('Image delete error:', error);
        throw error;
      })
    );
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
