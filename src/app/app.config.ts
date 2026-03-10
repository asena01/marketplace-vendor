import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { environment } from '../environments/environment';

import { routes } from './app.routes';

// Initialize Firebase
export function initializeFirebase() {
  return () => {
    try {
      const app = initializeApp(environment.firebaseConfig);
      getStorage(app);
      console.log('🔥 Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Firebase:', error);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: 'FIREBASE_INIT',
      useFactory: initializeFirebase,
      multi: true
    }
  ]
};
