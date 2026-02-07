import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/dashboard/pages/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'products',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/products/components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/products/components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/products/components/product-form/product-form.component').then(m => m.ProductFormComponent)
      }
    ]
  },
  {
    path: 'orders',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/orders/components/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/orders/components/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  },
  {
    path: 'affiliates',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/affiliates/components/affiliate-list/affiliate-list.component').then(m => m.AffiliateListComponent)
      },
      {
        path: 'add',
        loadComponent: () => import('./features/affiliates/components/affiliate-form/affiliate-form.component').then(m => m.AffiliateFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./features/affiliates/components/affiliate-detail/affiliate-detail.component').then(m => m.AffiliateDetailComponent)
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/affiliates/components/affiliate-form/affiliate-form.component').then(m => m.AffiliateFormComponent)
      },
      {
        path: ':id/links',
        loadComponent: () => import('./features/affiliates/components/link-generator/link-generator.component').then(m => m.LinkGeneratorComponent)
      }
    ]
  },
  {
    path: 'analytics',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/analytics/pages/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadComponent: () => import('./features/settings/pages/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];