import {inject, Injectable} from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AngularFireUploadService {
  // Dependency injection for Firebase storage
  private storage: Storage;

  constructor() {
    this.storage = inject(Storage);
    console.log('✅ AngularFireUploadService initialized with Firebase Storage');
  }

  /**
   * Upload a single image to Firebase Storage
   * @param file - Image file to upload
   * @param folder - Folder path (e.g., 'products')
   * @returns Observable with the download URL
   */
  uploadImage(file: File, folder: string): Observable<string> {
    return from(this.uploadImagePromise(file, folder));
  }

  /**
   * Upload multiple images to Firebase Storage sequentially
   * @param files - Array of image files to upload
   * @param folderPath - Folder path for storage
   * @returns Observable with an array of download URLs
   */
  uploadMultipleImages(files: File[], folderPath: string): Observable<string[]> {
    return from(this.uploadFilesSequentially(files, folderPath));
  }

  /**
   * Upload a single image - Promise version
   */
  private async uploadImagePromise(file: File, folder: string): Promise<string> {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    const filePath = `${folder}/${timestamp}-${random}-${file.name}`;

    console.log(`📤 Uploading: ${file.name} to ${filePath}`);

    try {
      const fileRef = ref(this.storage, filePath); // Use injectable storage instance

      const snapshot = await uploadBytes(fileRef, file);
      console.log(`✅ Uploaded ${file.name}, fetching download URL...`);

      // Get the download URL
      const url = await getDownloadURL(snapshot.ref);
      console.log(`🔗 Download URL for ${file.name}: ${url.substring(0, 60)}...`);
      return url;
    } catch (error: any) {
      console.error(`❌ Error uploading ${file.name}:`, error.message);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  /**
   * Upload multiple files sequentially with proper error handling
   */
  private async uploadFilesSequentially(files: File[], folderPath: string): Promise<string[]> {
    console.log(`📤 Starting upload of ${files.length} file(s)...`);
    const downloadUrls: string[] = [];

    for (const [index, file] of files.entries()) {
      console.log(`📤 [${index + 1}/${files.length}] Uploading: ${file.name}`);
      try {
        const url = await this.uploadImagePromise(file, folderPath);
        downloadUrls.push(url);
        console.log(`✅ [${index + 1}/${files.length}] Uploaded: ${file.name}`);
      } catch (error: any) {
        console.error(`❌ [${index + 1}/${files.length}] Failed to upload: ${file.name}`, error.message);
        throw error; // Stop processing further if any upload fails
      }
    }

    console.log(`✅ All files uploaded successfully!`);
    return downloadUrls;
  }

  /**
   * Delete an image from Firebase Storage
   * @param downloadUrl - The download URL of the image to delete
   * @returns Promise<void>
   */
  deleteImage(downloadUrl: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        // Decode and match file path from the download URL
        const decodedUrl = decodeURIComponent(downloadUrl);
        const match = decodedUrl.match(/\/o\/([^?]+)\?/);

        if (!match?.[1]) {
          reject(new Error('Invalid download URL format'));
          return;
        }

        const filePath = match[1];
        const fileRef = ref(this.storage, filePath); // Use injectable storage instance

        console.log(`🗑️ Deleting: ${filePath}`);
        deleteObject(fileRef)
          .then(() => {
            console.log(`✅ Deleted ${filePath} successfully`);
            resolve();
          })
          .catch((error) => {
            console.error(`❌ Failed to delete ${filePath}:`, error.message);
            reject(error);
          });
      } catch (error: any) {
        console.error(`❌ Error during deletion:`, error.message);
        reject(error);
      }
    });
  }
}
