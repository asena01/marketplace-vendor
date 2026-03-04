import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirebaseUploadService {
  private app: any;
  private storage: any;

  constructor() {
    // Initialize Firebase
    this.app = initializeApp(environment.firebaseConfig);
    this.storage = getStorage(this.app);
  }

  /**
   * Upload image to Firebase Storage
   * @param file - Image file to upload
   * @param path - Path in storage (e.g., 'hotels/hotel-id/thumbnail')
   * @returns Promise with download URL
   */
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Image uploaded successfully:', downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of files to upload
   * @param basePath - Base path for all files
   * @returns Promise with array of download URLs
   */
  async uploadMultipleImages(files: File[], basePath: string): Promise<string[]> {
    try {
      const uploadPromises = files.map((file, index) => {
        const path = `${basePath}/${Date.now()}-${index}-${file.name}`;
        return this.uploadImage(file, path);
      });
      const urls = await Promise.all(uploadPromises);
      console.log('✅ All images uploaded successfully');
      return urls;
    } catch (error) {
      console.error('❌ Error uploading multiple images:', error);
      throw error;
    }
  }

  /**
   * Delete image from Firebase Storage
   * @param url - Download URL of the image
   */
  async deleteImage(url: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, url);
      await deleteObject(storageRef);
      console.log('✅ Image deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }
}
