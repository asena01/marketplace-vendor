import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Firebase and @angular/fire imports
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideStorage, getStorage } from '@angular/fire/storage'; // For Firebase Storage
import { environment } from '../environments/environment';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // Providing necessary Angular modules and Firebase configurations
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideStorage(() => getStorage()), // Add Firebase Storage support
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ],
};
