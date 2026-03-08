import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ShoppingComponent } from './pages/shopping/shopping.component';
import { HotelsComponent } from './pages/hotels/hotels.component';
import { FoodComponent } from './pages/food/food.component';
import { ServicesComponent } from './pages/services/services.component';
import { ToursComponent } from './pages/tours/tours.component';
import { TourDetailComponent } from './pages/tours/tour-detail/tour-detail.component';
import { ServiceDetailComponent } from './pages/services/service-detail/service-detail.component';
import { FurnitureComponent } from './pages/furniture/furniture.component';
import { HairComponent } from './pages/hair/hair.component';
import { PetsComponent } from './pages/pets/pets.component';
import { GymComponent } from './pages/gym/gym.component';
import { DeliveryComponent } from './pages/delivery/delivery.component';
import { DeliveryNewComponent } from './pages/delivery/delivery-new.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { ToursSignupComponent } from './pages/auth/tours-signup/tours-signup.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { VendorDashboardComponent } from './pages/vendors/dashboard/vendor-dashboard.component';
import { VendorLoginComponent } from './pages/auth/vendor-login/vendor-login.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { DeliveryDashboardComponent } from './pages/delivery/delivery-dashboard/delivery-dashboard.component';
import { CustomerDashboardComponent } from './pages/customer/customer-dashboard/customer-dashboard.component';
import { HotelDashboardComponent } from './pages/vendors/dashboards/hotel-dashboard/hotel-dashboard.component';
import { RestaurantDashboardComponent } from './pages/vendors/dashboards/restaurant-dashboard/restaurant-dashboard.component';
import { RetailDashboardComponent } from './pages/vendors/dashboards/retail-dashboard/retail-dashboard.component';
import { ServiceDashboardComponent } from './pages/vendors/dashboards/service-dashboard/service-dashboard.component';
import { ToursDashboardComponent } from './pages/vendors/dashboards/tours-dashboard/tours-dashboard.component';
import { HotelDevicesComponent } from './pages/vendors/dashboards/hotel-dashboard/devices/devices.component';
import { AvailabilityCalendarComponent } from './pages/vendors/dashboards/hotel-dashboard/availability-calendar/availability-calendar.component';
import { PricingComponent } from './pages/vendors/dashboards/hotel-dashboard/pricing/pricing.component';
import { HotelRoomsComponent } from './pages/vendors/dashboards/hotel-dashboard/rooms/rooms.component';
import { HotelStaffComponent } from './pages/vendors/dashboards/hotel-dashboard/staff/staff.component';
import { HotelNotificationsComponent } from './pages/vendors/dashboards/hotel-dashboard/notifications/notifications.component';
import { HotelReviewsComponent } from './pages/vendors/dashboards/hotel-dashboard/reviews/reviews.component';
import { HotelBookingsComponent } from './pages/vendors/dashboards/hotel-dashboard/bookings/bookings.component';
import { HotelProfileComponent } from './pages/vendors/dashboards/hotel-dashboard/profile/profile.component';
import { RestaurantMenuComponent } from './pages/vendors/dashboards/restaurant-dashboard/menu/menu.component';
import { RestaurantOrdersComponent } from './pages/vendors/dashboards/restaurant-dashboard/orders/orders.component';
import { DeliveryOrdersComponent } from './pages/vendors/dashboards/restaurant-dashboard/delivery-orders/delivery-orders.component';
import { DriversComponent } from './pages/vendors/dashboards/restaurant-dashboard/drivers/drivers.component';
import { DriverTrackingComponent } from './pages/vendors/dashboards/restaurant-dashboard/driver-tracking/driver-tracking.component';
import { DeliveryAnalyticsComponent } from './pages/vendors/dashboards/restaurant-dashboard/delivery-analytics/delivery-analytics.component';
import { DeliverySupportComponent } from './pages/vendors/dashboards/restaurant-dashboard/delivery-support/delivery-support.component';
import { DeliveryIntegrationsComponent } from './pages/vendors/dashboards/restaurant-dashboard/delivery-integrations/delivery-integrations.component';
import { DeliveryTrackingMonitorComponent } from './pages/vendors/dashboards/restaurant-dashboard/delivery-tracking-monitor/delivery-tracking-monitor.component';
import { RetailProductsComponent } from './pages/vendors/dashboards/retail-dashboard/products/products.component';
import { RetailInventoryComponent } from './pages/vendors/dashboards/retail-dashboard/inventory/inventory.component';
import { RetailCustomersComponent } from './pages/vendors/dashboards/retail-dashboard/customers/customers.component';
import { RetailNotificationsComponent } from './pages/vendors/dashboards/retail-dashboard/notifications/notifications.component';
import { RetailShippingComponent } from './pages/vendors/dashboards/retail-dashboard/shipping/shipping.component';
import { RetailDeliveryIntegrationsComponent } from './pages/vendors/dashboards/retail-dashboard/delivery-integrations/delivery-integrations.component';
import { RetailDeliveryTrackingComponent } from './pages/vendors/dashboards/retail-dashboard/delivery-tracking/delivery-tracking.component';
import { OrdersComponent } from './pages/vendors/dashboards/retail-dashboard/orders/orders.component';
import { PaymentsComponent } from './pages/vendors/dashboards/retail-dashboard/payments/payments.component';
import { ReturnsComponent } from './pages/vendors/dashboards/retail-dashboard/returns/returns.component';
import { ReviewManagementComponent } from './pages/vendors/dashboards/shared/review-management/review-management.component';
import { IncidentManagementComponent } from './pages/vendors/dashboards/shared/incident-management/incident-management.component';
import { ProfileSettingsComponent } from './pages/vendors/dashboards/shared/profile-settings/profile-settings.component';
import { ServiceAppointmentsComponent } from './pages/vendors/dashboards/service-dashboard/appointments/appointments.component';
import { ServiceServicesComponent } from './pages/vendors/dashboards/service-dashboard/services/services.component';
import { ServiceStaffComponent } from './pages/vendors/dashboards/service-dashboard/staff/staff.component';
import { ServiceClientsComponent } from './pages/vendors/dashboards/service-dashboard/clients/clients.component';
import { ServiceReportsComponent } from './pages/vendors/dashboards/service-dashboard/reports/reports.component';
import { ServiceNotificationsComponent } from './pages/vendors/dashboards/service-dashboard/notifications/notifications.component';
import { VendorGuard } from './guards/vendor.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vendor-login', component: VendorLoginComponent },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'delivery-dashboard', component: DeliveryDashboardComponent, canActivate: [VendorGuard] },
  // Hotel Dashboard Routes
  {
    path: 'hotel-dashboard',
    component: HotelDashboardComponent,
    canActivate: [VendorGuard],
    children: [
      { path: 'calendar', component: AvailabilityCalendarComponent },
      { path: 'pricing', component: PricingComponent },
      { path: 'devices', component: HotelDevicesComponent },
      { path: 'rooms', component: HotelRoomsComponent },
      { path: 'staff', component: HotelStaffComponent },
      { path: 'bookings', component: HotelBookingsComponent },
      { path: 'notifications', component: HotelNotificationsComponent },
      { path: 'reviews', component: HotelReviewsComponent },
      { path: 'incidents', component: IncidentManagementComponent },
      { path: 'settings', component: HotelProfileComponent }
    ]
  },
  // Restaurant Dashboard Routes
  {
    path: 'restaurant-dashboard',
    component: RestaurantDashboardComponent,
    canActivate: [VendorGuard],
    children: [
      { path: 'menu', component: RestaurantMenuComponent },
      { path: 'orders', component: RestaurantOrdersComponent },
      { path: 'delivery-orders', component: DeliveryOrdersComponent },
      { path: 'drivers', component: DriversComponent },
      { path: 'driver-tracking', component: DriverTrackingComponent },
      { path: 'delivery-analytics', component: DeliveryAnalyticsComponent },
      { path: 'delivery-support', component: DeliverySupportComponent },
      { path: 'delivery-integrations', component: DeliveryIntegrationsComponent },
      { path: 'delivery-tracking', component: DeliveryTrackingMonitorComponent },
      { path: 'reviews', component: ReviewManagementComponent },
      { path: 'incidents', component: IncidentManagementComponent },
      { path: 'settings', component: ProfileSettingsComponent }
    ]
  },
  // Retail Dashboard Routes
  {
    path: 'retail-dashboard',
    component: RetailDashboardComponent,
    canActivate: [VendorGuard],
    children: [
      { path: 'products', component: RetailProductsComponent },
      { path: 'inventory', component: RetailInventoryComponent },
      { path: 'orders', component: OrdersComponent },
      { path: 'payments', component: PaymentsComponent },
      { path: 'returns', component: ReturnsComponent },
      { path: 'customers', component: RetailCustomersComponent },
      { path: 'notifications', component: RetailNotificationsComponent },
      { path: 'shipping', component: RetailShippingComponent },
      { path: 'delivery-integrations', component: RetailDeliveryIntegrationsComponent },
      { path: 'delivery-tracking', component: RetailDeliveryTrackingComponent },
      { path: 'reviews', component: ReviewManagementComponent },
      { path: 'incidents', component: IncidentManagementComponent },
      { path: 'settings', component: ProfileSettingsComponent }
    ]
  },
  // Service Dashboard Routes
  {
    path: 'service-dashboard',
    component: ServiceDashboardComponent,
    canActivate: [VendorGuard],
    children: [
      { path: 'appointments', component: ServiceAppointmentsComponent },
      { path: 'services', component: ServiceServicesComponent },
      { path: 'staff', component: ServiceStaffComponent },
      { path: 'clients', component: ServiceClientsComponent },
      { path: 'reviews', component: ReviewManagementComponent },
      { path: 'incidents', component: IncidentManagementComponent },
      { path: 'reports', component: ServiceReportsComponent },
      { path: 'notifications', component: ServiceNotificationsComponent },
      { path: 'settings', component: ProfileSettingsComponent }
    ]
  },
  // Tours Dashboard Routes
  {
    path: 'tours-dashboard',
    component: ToursDashboardComponent,
    canActivate: [VendorGuard],
    children: [
      { path: 'reviews', component: ReviewManagementComponent },
      { path: 'incidents', component: IncidentManagementComponent },
      { path: 'settings', component: ProfileSettingsComponent }
    ]
  },
  { path: 'signup', component: SignupComponent },
  { path: 'tours-signup', component: ToursSignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'shopping', component: ShoppingComponent },
  { path: 'hotels', component: HotelsComponent },
  { path: 'food', component: FoodComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'services/:id', component: ServiceDetailComponent },
  { path: 'tours', component: ToursComponent },
  { path: 'tours/:id', component: TourDetailComponent },
  { path: 'delivery', component: DeliveryNewComponent },
  { path: 'furniture', component: FurnitureComponent },
  { path: 'hair', component: HairComponent },
  { path: 'pets', component: PetsComponent },
  { path: 'gym', component: GymComponent },
  { path: 'vendor-dashboard/:vendorType', component: VendorDashboardComponent, canActivate: [VendorGuard] },
  { path: 'vendor-dashboard/:vendorType/:page', component: VendorDashboardComponent, canActivate: [VendorGuard] },
];
