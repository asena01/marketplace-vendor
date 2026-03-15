import { inject, Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // If using compat
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, from } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AngularFireUploadService {
  private storage = inject(Storage);

  constructor() {
    console.log('✅ AngularFireUploadService initialized with Firebase Storage');
  }

  /**
   * Upload a single file directly to Firebase Storage
   * @param file - File to upload
   * @param folderPath - Folder path in storage, e.g., 'products/vendorId'
   * @returns Observable of the download URL
   */
  uploadImage(file: File, folderPath: string): Observable<string> {
    const timestamp = Date.now();
    const folder = folderPath || 'products';
    const storageRef = ref(this.storage, `${folder}/${timestamp}-${file.name}`);

    const task = uploadBytesResumable(storageRef, file);

    return new Observable<string>((observer) => {
      task.on(
        'state_changed',
        (snapshot) => {
          // Optional: progress tracking
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`📤 Upload progress: ${progress.toFixed(2)}%`);
        },
        (error) => {
          console.error('❌ Upload error:', error);
          observer.error(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(task.snapshot.ref);
            console.log('✅ Upload complete:', downloadUrl);
            observer.next(downloadUrl);
            observer.complete();
          } catch (err) {
            observer.error(err);
          }
        }
      );
    });
  }

  /**
   * Upload multiple files
   * @param files - Array of files
   * @param folderPath - Folder path in storage
   * @returns Observable with array of download URLs
   */
  uploadMultipleImages(files: File[], folderPath: string): Observable<string[]> {
  const promises = files.map(file =>
    this.uploadImage(file, folderPath).toPromise()
  );

  return from(
    Promise.all(promises).then(urls => urls.filter((u): u is string => !!u))
  );
}

  /**
   * Delete a file by its Firebase Storage URL
   * @param downloadUrl - Full Firebase Storage URL
   * @returns Promise<void>
   */
  async deleteImage(downloadUrl: string): Promise<void> {
    try {
      // Convert URL to storage path
      const storageBase = `https://firebasestorage.googleapis.com/v0/b/${environment.firebaseConfig.storageBucket}/o/`;
      const encodedPath = downloadUrl.replace(storageBase, '').split('?')[0];
      const fileRef = ref(this.storage, decodeURIComponent(encodedPath));
      await deleteObject(fileRef);
      console.log('🗑️ File deleted successfully:', downloadUrl);
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw error;
    }
  }
}