import { Routes } from '@angular/router';
import { DashboardLayoutComponent } from './layout/dashboard-layout';
import { DashboardHomeComponent } from './pages/dashboard-home';
import { PlaceholderComponent } from './pages/placeholder';
import { VendorDashboardComponent } from './pages/vendor/dashboard/vendor-dashboard.component';
import { HotelDashboardComponent } from './pages/vendor/dashboards/hotel-dashboard/hotel-dashboard.component';
import { RestaurantDashboardComponent } from './pages/vendor/dashboards/restaurant-dashboard/restaurant-dashboard.component';
import { RetailDashboardComponent } from './pages/vendor/dashboards/retail-dashboard/retail-dashboard.component';
import { ServiceDashboardComponent } from './pages/vendor/dashboards/service-dashboard/service-dashboard.component';
import { ToursDashboardComponent } from './pages/vendor/dashboards/tours-dashboard/tours-dashboard.component';

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
  {
    path: 'vendor',
    component: DashboardLayoutComponent,
    children: [
      {
        path: '',
        component: VendorDashboardComponent,
      },
      {
        path: 'dashboards/hotel',
        component: HotelDashboardComponent,
      },
      {
        path: 'dashboards/restaurant',
        component: RestaurantDashboardComponent,
      },
      {
        path: 'dashboards/retail',
        component: RetailDashboardComponent,
      },
      {
        path: 'dashboards/service',
        component: ServiceDashboardComponent,
      },
      {
        path: 'dashboards/tours',
        component: ToursDashboardComponent,
      },
    ],
  },
];
