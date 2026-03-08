# Vendor Dashboard CRUD Implementation Guide

## Overview
This guide outlines all the CRUD (Create, Read, Update, Delete) components needed for each vendor dashboard type, along with implementation patterns and integration points.

---

## Implementation Status

### ✅ COMPLETED Components

#### Hotel Dashboard
- **Rooms CRUD** (`src/app/pages/vendors/dashboards/hotel-dashboard/rooms/rooms.component.ts`)
  - Create, Read, Update, Delete rooms
  - Search, filter by type and status
  - Statistics: Available, Occupied, Cleaning, Maintenance counts
  - Route: `/hotel-dashboard/rooms`

- **Staff CRUD** (`src/app/pages/vendors/dashboards/hotel-dashboard/staff/staff.component.ts`)
  - Manage hotel staff members
  - Positions: Manager, Receptionist, Housekeeper, Chef, Waiter, Maintenance
  - Filter by position and employment status
  - Route: `/hotel-dashboard/staff`

---

## ⏳ TODO Components

### Hotel Dashboard
1. **Bookings Management** (`/hotel-dashboard/bookings`)
   - List all bookings with search/filter
   - Check-in/Check-out functionality
   - View guest details
   - Update booking status
   - Cancel bookings

2. **Invoices** (`/hotel-dashboard/invoices`)
   - Generate invoices for bookings
   - View invoice history
   - Download PDF
   - Payment status tracking

---

### Restaurant Dashboard
1. **Menu Management** (`/restaurant-dashboard/menu`)
   - Add/Edit/Delete menu items
   - Categories (Appetizers, Main Course, Desserts, Beverages)
   - Pricing and descriptions
   - Upload images
   - Search and filter

2. **Orders Management** (`/restaurant-dashboard/orders`)
   - View all orders with timestamps
   - Order status: Pending, Preparing, Ready, Served, Completed
   - Update order status
   - View order details (items, price, customer)
   - Cancel orders with reason

3. **Reservations** (`/restaurant-dashboard/reservations`)
   - Create reservations
   - View calendar view
   - Guest details
   - Table assignment
   - Status management

4. **Inventory** (`/restaurant-dashboard/inventory`)
   - Track ingredient stock
   - Low stock alerts
   - Supplier information
   - Stock adjustments
   - Batch management

---

### Retail Dashboard
1. **Products Management** (`/retail-dashboard/products`)
   - Full CRUD for products
   - Categories and subcategories
   - Pricing (original, discount)
   - Images (multiple upload)
   - Stock tracking
   - Search and bulk actions

2. **Inventory Management** (`/retail-dashboard/inventory`)
   - Stock levels by location/warehouse
   - Stock in/out transfers
   - Low stock warnings
   - Inventory adjustments
   - SKU management

3. **Orders** (`/retail-dashboard/orders`)
   - View customer orders
   - Order status tracking
   - Refund management
   - Shipping integration

---

### Service Provider Dashboard
1. **Services Management** (`/service-dashboard/services`)
   - Add/Edit/Delete services
   - Pricing and duration
   - Description and images
   - Availability settings
   - Service categories

2. **Staff/Technicians** (`/service-dashboard/staff`)
   - Manage service providers
   - Skills/specializations
   - Availability calendar
   - Ratings and reviews
   - Assignment to services

3. **Appointments/Bookings** (`/service-dashboard/appointments`)
   - View all appointments
   - Status: Pending, Confirmed, In Progress, Completed, Cancelled
   - Customer information
   - Service details
   - Payment status

---

### Tours Operator Dashboard
1. **Tours Management** (`/tours-dashboard/tours`)
   - Create/Edit/Delete tours
   - Itineraries management
   - Pricing and availability
   - Group size limits
   - Images and descriptions

2. **Guides Management** (`/tours-dashboard/guides`)
   - Add tour guides
   - Languages spoken
   - Availability calendar
   - Ratings
   - Assignment to tours

3. **Bookings** (`/tours-dashboard/bookings`)
   - View all tour bookings
   - Passenger details
   - Payment status
   - Status management
   - Cancellations

---

## Component Implementation Pattern

### Standard CRUD Component Structure

Each CRUD component should include:

```typescript
// 1. Interface for the data model
interface Item {
  _id?: string;
  // fields
}

// 2. Component class with signals for:
class ItemComponent {
  items = signal<Item[]>([]);
  filteredItems = signal<Item[]>([]);
  showModal = signal(false);
  isEditing = signal(false);
  searchQuery = signal('');
  successMessage = signal('');
  errorMessage = signal('');
  newItem: Item = {};
  
  // Methods:
  loadItems() { }
  filterItems() { }
  openAddModal() { }
  editItem(item) { }
  closeModal() { }
  saveItem() { }
  deleteItem(id) { }
}
```

### Template Features Required

1. **Header Section**
   - Title and description
   - Add New button
   - Action buttons (bulk operations)

2. **Filter/Search Bar**
   - Search input
   - Filter dropdowns (by type, status, category, etc.)
   - Clear filters button

3. **Statistics Cards**
   - Total count
   - Status counts (Available, Active, etc.)
   - Other key metrics

4. **Data Table**
   - Columns relevant to the resource
   - Row actions (Edit, Delete)
   - Hover effects
   - Empty state

5. **Add/Edit Modal**
   - Form fields (auto-validate)
   - Required field indicators
   - Cancel and Submit buttons
   - Field validation with error messages

6. **Feedback Messages**
   - Success toasts
   - Error toasts
   - Auto-dismiss after 3 seconds

---

## Integration with Services

### Service Layer Updates Needed

Each CRUD component needs service methods. Update the respective services:

1. **HotelService** (`src/app/services/hotel.service.ts`)
   - getRooms()
   - addRoom(room)
   - updateRoom(id, room)
   - deleteRoom(id)
   - getStaff()
   - addStaff(staff)
   - updateStaff(id, staff)
   - deleteStaff(id)
   - getBookings()
   - createBooking(booking)
   - updateBookingStatus(id, status)

2. **FoodService** (`src/app/services/food.service.ts`)
   - getMenuItems()
   - addMenuItem(item)
   - updateMenuItem(id, item)
   - deleteMenuItem(id)
   - getOrders()
   - updateOrderStatus(id, status)
   - getReservations()

3. **ProductService** (`src/app/services/product.service.ts`)
   - getProducts()
   - addProduct(product)
   - updateProduct(id, product)
   - deleteProduct(id)
   - bulkImportProducts(file)
   - bulkUpdateStatus(ids, status)

4. **ServiceService** (`src/app/services/service.service.ts`)
   - getServices()
   - addService(service)
   - updateService(id, service)
   - deleteService(id)
   - getAppointments()
   - updateAppointmentStatus(id, status)

---

## Routing Configuration

### Current Routes (Updated)
```typescript
// Hotel Dashboard
{ path: 'hotel-dashboard/rooms', component: HotelRoomsComponent }
{ path: 'hotel-dashboard/staff', component: HotelStaffComponent }

// To Add:
{ path: 'hotel-dashboard/bookings', component: HotelBookingsComponent }
{ path: 'hotel-dashboard/invoices', component: HotelInvoicesComponent }

// Restaurant Dashboard
// To Add:
{ path: 'restaurant-dashboard/menu', component: RestaurantMenuComponent }
{ path: 'restaurant-dashboard/orders', component: RestaurantOrdersComponent }
{ path: 'restaurant-dashboard/reservations', component: RestaurantReservationsComponent }
{ path: 'restaurant-dashboard/inventory', component: RestaurantInventoryComponent }

// Similar for Retail, Service, Tours
```

All routes should be protected with `canActivate: [VendorGuard]`

---

## Advanced Features to Add

### 1. Bulk Operations
- **Select Multiple**: Checkboxes in table header
- **Bulk Actions**: Delete, Update Status, Export
- **Batch Upload**: CSV/Excel import

### 2. Advanced Filtering
- **Date Range Filters**: For bookings, orders, dates
- **Price Range**: For products, services, rooms
- **Multi-select Filters**: Categories, statuses, types

### 3. Search Capabilities
- **Full-text Search**: Name, email, description
- **Advanced Search**: Multiple field combination
- **Search History**: Recent searches

### 4. Sorting & Pagination
- **Column Sorting**: Click headers to sort
- **Pagination**: 10, 25, 50 items per page
- **Sort Order**: Ascending/Descending

### 5. Export/Import
- **Export CSV**: Download table data
- **Export PDF**: Formatted reports
- **Import CSV/Excel**: Batch create items

### 6. Analytics & Reporting
- **Dashboard Charts**: Visualize data
- **Revenue Reports**: Income tracking
- **Usage Statistics**: Popular items, peak times

---

## Best Practices

### 1. State Management
- Use Angular signals for reactive updates
- Avoid unnecessary re-renders
- Keep modal state separate from list state

### 2. Validation
- Required field validation in forms
- Email/phone format validation
- Price/number minimum values
- Prevent duplicate entries

### 3. User Feedback
- Show loading states
- Success/error toast notifications
- Confirmation dialogs for deletions
- Disabled buttons during async operations

### 4. Performance
- Debounce search inputs
- Lazy load large lists
- Cache API responses
- Implement pagination for large datasets

### 5. Accessibility
- Proper label associations
- Keyboard navigation support
- ARIA attributes for screen readers
- Color contrast compliance

---

## Database Models Reference

These models should exist in your backend (`backend/functions/models/`):

- Hotel.js - Hotel details
- Room.js - Room information
- Booking.js - Hotel bookings
- Staff.js - Hotel staff
- Invoice.js - Hotel invoices
- RestaurantMenu.js - Menu items
- RestaurantOrder.js - Orders
- ServiceBooking.js - Service appointments
- Service.js - Service offerings
- Product.js - Retail products
- Tour.js - Tour packages

All models should include:
- `_id` (MongoDB ObjectId)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)
- `vendorId` or `hotelId` or `restaurantId` (Foreign key)
- Relevant status fields

---

## Testing Checklist

For each component, test:
- [ ] Load and display data
- [ ] Create new item with valid data
- [ ] Show error for missing required fields
- [ ] Edit existing item
- [ ] Update item fields
- [ ] Delete item with confirmation
- [ ] Search functionality
- [ ] Filter by multiple criteria
- [ ] Display empty state
- [ ] Show success/error messages
- [ ] Modal opens/closes properly
- [ ] Form resets after save
- [ ] Responsive design (mobile, tablet, desktop)

---

## Quick Implementation Checklist

### For Each New CRUD Component:
- [ ] Create component file with TypeScript class
- [ ] Define data interface
- [ ] Import CommonModule, FormsModule
- [ ] Create standalone component with template
- [ ] Implement loadData() in ngOnInit()
- [ ] Add search/filter inputs
- [ ] Create data table with actions
- [ ] Add statistics cards
- [ ] Implement Add/Edit modal
- [ ] Add form validation
- [ ] Implement save() method
- [ ] Implement delete() method with confirmation
- [ ] Add success/error messages
- [ ] Update app.routes.ts with new route
- [ ] Import component in routes file
- [ ] Test all CRUD operations

---

## API Endpoint Convention

All endpoints follow RESTful pattern:

```
GET    /api/{resource}              - List all
GET    /api/{resource}?search=...   - Search
POST   /api/{resource}              - Create
GET    /api/{resource}/:id          - Get one
PUT    /api/{resource}/:id          - Update
DELETE /api/{resource}/:id          - Delete
POST   /api/{resource}/bulk         - Bulk operations
```

---

## Next Steps

1. **Priority 1** - Complete Hotel & Restaurant CRUD
   - Create remaining Hotel components
   - Create all Restaurant components
   
2. **Priority 2** - Implement for Retail & Service
   - Create Products & Inventory CRUD
   - Create Service & Appointments CRUD

3. **Priority 3** - Add Advanced Features
   - Bulk operations
   - Import/Export functionality
   - Analytics dashboards

4. **Priority 4** - Polish & Testing
   - Complete test coverage
   - Performance optimization
   - Accessibility improvements

---

## File Locations Reference

```
src/app/pages/vendors/dashboards/
├── hotel-dashboard/
│   ├── rooms/rooms.component.ts ✅
│   ├── staff/staff.component.ts ✅
│   ├── bookings/ (TODO)
│   ├── invoices/ (TODO)
│   └── ...
├── restaurant-dashboard/
│   ├── menu/ (TODO)
│   ├── orders/ (TODO)
│   ├── reservations/ (TODO)
│   ├── inventory/ (TODO)
│   └── ...
├── retail-dashboard/
│   ├── products/ (TODO)
│   ├── inventory/ (TODO)
│   └── ...
├── service-dashboard/
│   ├── services/ (TODO)
│   ├── staff/ (TODO)
│   ├── appointments/ (TODO)
│   └── ...
├── tours-dashboard/
│   ├── tours/ (TODO)
│   ├── guides/ (TODO)
│   ├── bookings/ (TODO)
│   └── ...
└── shared/
    ├── review-management/
    └── incident-management/
```

---

## Support & References

- Angular 20+ Documentation: https://angular.io/docs
- TailwindCSS Classes: https://tailwindcss.com/docs
- Angular Signals: https://angular.io/guide/signals
- Standalone Components: https://angular.io/guide/standalone-components

