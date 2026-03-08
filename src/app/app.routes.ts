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
import { DeviceManagementComponent } from './pages/vendors/dashboards/hotel-dashboard/device-management/device-management.component';
import { HotelRoomsComponent } from './pages/vendors/dashboards/hotel-dashboard/rooms/rooms.component';
import { HotelStaffComponent } from './pages/vendors/dashboards/hotel-dashboard/staff/staff.component';
import { RestaurantMenuComponent } from './pages/vendors/dashboards/restaurant-dashboard/menu/menu.component';
import { RestaurantOrdersComponent } from './pages/vendors/dashboards/restaurant-dashboard/orders/orders.component';
import { RetailProductsComponent } from './pages/vendors/dashboards/retail-dashboard/products/products.component';
import { ReviewManagementComponent } from './pages/vendors/dashboards/shared/review-management/review-management.component';
import { IncidentManagementComponent } from './pages/vendors/dashboards/shared/incident-management/incident-management.component';
import { VendorGuard } from './guards/vendor.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'vendor-login', component: VendorLoginComponent },
  { path: 'customer-dashboard', component: CustomerDashboardComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AdminGuard] },
  { path: 'delivery-dashboard', component: DeliveryDashboardComponent, canActivate: [VendorGuard] },
  // Hotel Dashboard Routes - Specific routes BEFORE catch-all
  { path: 'hotel-dashboard/devices', component: DeviceManagementComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard/rooms', component: HotelRoomsComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard/staff', component: HotelStaffComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard/reviews', component: ReviewManagementComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard/incidents', component: IncidentManagementComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard/:page', component: HotelDashboardComponent, canActivate: [VendorGuard] },
  { path: 'hotel-dashboard', component: HotelDashboardComponent, canActivate: [VendorGuard] },
  // Restaurant Dashboard Routes
  { path: 'restaurant-dashboard/menu', component: RestaurantMenuComponent, canActivate: [VendorGuard] },
  { path: 'restaurant-dashboard/orders', component: RestaurantOrdersComponent, canActivate: [VendorGuard] },
  { path: 'restaurant-dashboard/reviews', component: ReviewManagementComponent, canActivate: [VendorGuard] },
  { path: 'restaurant-dashboard/incidents', component: IncidentManagementComponent, canActivate: [VendorGuard] },
  { path: 'restaurant-dashboard/:page', component: RestaurantDashboardComponent, canActivate: [VendorGuard] },
  { path: 'restaurant-dashboard', component: RestaurantDashboardComponent, canActivate: [VendorGuard] },
  // Retail Dashboard Routes
  { path: 'retail-dashboard/products', component: RetailProductsComponent, canActivate: [VendorGuard] },
  { path: 'retail-dashboard/reviews', component: ReviewManagementComponent, canActivate: [VendorGuard] },
  { path: 'retail-dashboard/incidents', component: IncidentManagementComponent, canActivate: [VendorGuard] },
  { path: 'retail-dashboard/:page', component: RetailDashboardComponent, canActivate: [VendorGuard] },
  { path: 'retail-dashboard', component: RetailDashboardComponent, canActivate: [VendorGuard] },
  // Service Dashboard Routes
  { path: 'service-dashboard/reviews', component: ReviewManagementComponent, canActivate: [VendorGuard] },
  { path: 'service-dashboard/incidents', component: IncidentManagementComponent, canActivate: [VendorGuard] },
  { path: 'service-dashboard/:page', component: ServiceDashboardComponent, canActivate: [VendorGuard] },
  { path: 'service-dashboard', component: ServiceDashboardComponent, canActivate: [VendorGuard] },
  // Tours Dashboard Routes
  { path: 'tours-dashboard/reviews', component: ReviewManagementComponent, canActivate: [VendorGuard] },
  { path: 'tours-dashboard/incidents', component: IncidentManagementComponent, canActivate: [VendorGuard] },
  { path: 'tours-dashboard/:page', component: ToursDashboardComponent, canActivate: [VendorGuard] },
  { path: 'tours-dashboard', component: ToursDashboardComponent, canActivate: [VendorGuard] },
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
  { path: 'delivery', component: DeliveryComponent },
  { path: 'furniture', component: FurnitureComponent },
  { path: 'hair', component: HairComponent },
  { path: 'pets', component: PetsComponent },
  { path: 'gym', component: GymComponent },
  { path: 'vendor-dashboard/:vendorType', component: VendorDashboardComponent, canActivate: [VendorGuard] },
  { path: 'vendor-dashboard/:vendorType/:page', component: VendorDashboardComponent, canActivate: [VendorGuard] },
];
