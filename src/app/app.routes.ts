import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout';
import { DashboardHomeComponent } from './pages/dashboard-home';
import { PlaceholderComponent } from './pages/placeholder';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: DashboardHomeComponent,
      },
      {
        path: 'analytics',
        component: PlaceholderComponent,
      },
      {
        path: 'reports',
        component: PlaceholderComponent,
      },
      {
        path: 'settings',
        component: PlaceholderComponent,
      },
    ],
  },
];
