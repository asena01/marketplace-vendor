# API Integration Guide for Vendor Dashboard CRUD Components

## Overview
This guide explains how to integrate the CRUD components with real backend API calls instead of mock data.

---

## Current Implementation Status

### ✅ Components Ready for Integration
1. **Hotel Dashboard**
   - Rooms CRUD (`rooms.component.ts`)
   - Staff CRUD (`staff.component.ts`)

2. **Restaurant Dashboard**
   - Menu CRUD (`menu.component.ts`)
   - Orders CRUD (`orders.component.ts`)

3. **Retail Dashboard**
   - Products CRUD (`products.component.ts`)

All components currently use **mock data** in their `loadData()` methods. The API integration involves replacing this mock data with actual service calls.

---

## Step-by-Step Integration Process

### Step 1: Update Service Methods

For each service (HotelService, FoodService, ProductService), implement these CRUD methods:

#### Example: HotelService

```typescript
// src/app/services/hotel.service.ts

// GET all items
getRooms(): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.get(`${this.apiUrl}/hotels/${hotelId}/rooms`);
}

// GET single item
getRoomById(roomId: string): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.get(`${this.apiUrl}/hotels/${hotelId}/rooms/${roomId}`);
}

// CREATE item
addRoom(room: any): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.post(`${this.apiUrl}/hotels/${hotelId}/rooms`, room);
}

// UPDATE item
updateRoom(roomId: string, room: any): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.put(`${this.apiUrl}/hotels/${hotelId}/rooms/${roomId}`, room);
}

// DELETE item
deleteRoom(roomId: string): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.delete(`${this.apiUrl}/hotels/${hotelId}/rooms/${roomId}`);
}

// Similar methods for staff...
```

### Step 2: Update Component Methods

Replace the mock data loading with actual API calls:

#### Before (Mock Data):
```typescript
loadRooms() {
  const mockRooms = [ /* ... */ ];
  this.rooms.set(mockRooms);
  this.filterRooms();
}
```

#### After (API Call):
```typescript
loadRooms() {
  this.hotelService.getRooms().subscribe({
    next: (response) => {
      if (response.success && response.data) {
        this.rooms.set(response.data);
        this.filterRooms();
      }
    },
    error: (error) => {
      this.errorMessage.set('Failed to load rooms');
      console.error(error);
    }
  });
}
```

### Step 3: Update Save Method

Replace the client-side save logic with API calls:

#### Before (Mock):
```typescript
saveRoom() {
  if (this.isEditing()) {
    // Update in array
    const index = this.rooms().findIndex(r => r._id === this.newRoom._id);
    // ...
  } else {
    // Add to array
    this.rooms.set([...this.rooms(), this.newRoom]);
  }
}
```

#### After (API):
```typescript
saveRoom() {
  if (this.isEditing()) {
    this.hotelService.updateRoom(this.newRoom._id, this.newRoom).subscribe({
      next: () => {
        this.successMessage.set('Room updated successfully!');
        this.loadRooms();
        this.closeRoomModal();
      },
      error: (error) => {
        this.errorMessage.set('Failed to update room: ' + error.message);
      }
    });
  } else {
    this.hotelService.addRoom(this.newRoom).subscribe({
      next: () => {
        this.successMessage.set('Room created successfully!');
        this.loadRooms();
        this.closeRoomModal();
      },
      error: (error) => {
        this.errorMessage.set('Failed to create room: ' + error.message);
      }
    });
  }
}
```

### Step 4: Update Delete Method

Replace with API call:

#### After (API):
```typescript
deleteRoom(roomId?: string) {
  if (!roomId) return;
  
  if (confirm('Are you sure you want to delete this room?')) {
    this.hotelService.deleteRoom(roomId).subscribe({
      next: () => {
        this.successMessage.set('Room deleted successfully!');
        this.loadRooms();
      },
      error: (error) => {
        this.errorMessage.set('Failed to delete room: ' + error.message);
      }
    });
  }
}
```

---

## Service Methods Required

### HotelService Methods

```typescript
// Rooms
getRooms(): Observable<any>
getRoomById(id: string): Observable<any>
addRoom(room: any): Observable<any>
updateRoom(id: string, room: any): Observable<any>
deleteRoom(id: string): Observable<any>

// Staff
getStaff(): Observable<any>
getStaffById(id: string): Observable<any>
addStaff(staff: any): Observable<any>
updateStaff(id: string, staff: any): Observable<any>
deleteStaff(id: string): Observable<any>
```

### FoodService Methods

```typescript
// Menu Items
getMenuItems(): Observable<any>
getMenuItemById(id: string): Observable<any>
addMenuItem(item: any): Observable<any>
updateMenuItem(id: string, item: any): Observable<any>
deleteMenuItem(id: string): Observable<any>

// Orders
getOrders(): Observable<any>
getOrderById(id: string): Observable<any>
createOrder(order: any): Observable<any>
updateOrder(id: string, order: any): Observable<any>
deleteOrder(id: string): Observable<any>
updateOrderStatus(id: string, status: string): Observable<any>
```

### ProductService Methods

```typescript
// Products
getProducts(): Observable<any>
getProductById(id: string): Observable<any>
addProduct(product: any): Observable<any>
updateProduct(id: string, product: any): Observable<any>
deleteProduct(id: string): Observable<any>
bulkImportProducts(file: File): Observable<any>
```

---

## Backend API Endpoints Expected

### Hotel Endpoints
```
GET    /api/hotels/:hotelId/rooms
GET    /api/hotels/:hotelId/rooms/:roomId
POST   /api/hotels/:hotelId/rooms
PUT    /api/hotels/:hotelId/rooms/:roomId
DELETE /api/hotels/:hotelId/rooms/:roomId

GET    /api/hotels/:hotelId/staff
GET    /api/hotels/:hotelId/staff/:staffId
POST   /api/hotels/:hotelId/staff
PUT    /api/hotels/:hotelId/staff/:staffId
DELETE /api/hotels/:hotelId/staff/:staffId
```

### Restaurant Endpoints
```
GET    /api/restaurants/:restaurantId/menu
POST   /api/restaurants/:restaurantId/menu
PUT    /api/restaurants/:restaurantId/menu/:itemId
DELETE /api/restaurants/:restaurantId/menu/:itemId

GET    /api/restaurants/:restaurantId/orders
POST   /api/restaurants/:restaurantId/orders
PUT    /api/restaurants/:restaurantId/orders/:orderId
DELETE /api/restaurants/:restaurantId/orders/:orderId
PATCH  /api/restaurants/:restaurantId/orders/:orderId/status
```

### Retail Endpoints
```
GET    /api/retail/:storeId/products
GET    /api/retail/:storeId/products/:productId
POST   /api/retail/:storeId/products
PUT    /api/retail/:storeId/products/:productId
DELETE /api/retail/:storeId/products/:productId
POST   /api/retail/:storeId/products/bulk-import
```

---

## Response Format Expected

All API endpoints should return responses in this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Item or array of items
  },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

---

## Error Handling

Components should handle these common errors:

```typescript
subscribe({
  next: (response) => {
    // Handle success
  },
  error: (error) => {
    if (error.status === 401) {
      // Handle authentication error
      this.authService.logout();
    } else if (error.status === 403) {
      // Handle authorization error
      this.errorMessage.set('You do not have permission to perform this action');
    } else if (error.status === 404) {
      // Handle not found
      this.errorMessage.set('Resource not found');
    } else {
      // Handle other errors
      this.errorMessage.set(error.message || 'An error occurred');
    }
  }
});
```

---

## Loading States

Components should show loading states during API calls:

```typescript
loadRooms() {
  this.isLoading.set(true);
  
  this.hotelService.getRooms().subscribe({
    next: (response) => {
      this.rooms.set(response.data);
      this.filterRooms();
      this.isLoading.set(false);
    },
    error: (error) => {
      this.errorMessage.set('Failed to load rooms');
      this.isLoading.set(false);
    }
  });
}
```

Then in the template:

```html
@if (isLoading()) {
  <div class="text-center py-4">
    <p>Loading...</p>
  </div>
}
```

---

## Implementation Checklist

- [ ] Update HotelService with CRUD methods
- [ ] Update FoodService with CRUD methods
- [ ] Update ProductService with CRUD methods
- [ ] Update HotelRoomsComponent to use service
- [ ] Update HotelStaffComponent to use service
- [ ] Update RestaurantMenuComponent to use service
- [ ] Update RestaurantOrdersComponent to use service
- [ ] Update RetailProductsComponent to use service
- [ ] Add loading states to components
- [ ] Test all CRUD operations
- [ ] Verify error handling
- [ ] Test with real backend

---

## Quick Reference: Complete Integration Example

Here's a complete example for one CRUD operation:

### Service Method
```typescript
getRooms(): Observable<any> {
  const hotelId = localStorage.getItem('hotelId');
  return this.http.get(`${this.apiUrl}/hotels/${hotelId}/rooms`);
}
```

### Component Method
```typescript
loadRooms() {
  this.isLoading.set(true);
  this.hotelService.getRooms().subscribe({
    next: (response) => {
      if (response.success && Array.isArray(response.data)) {
        this.rooms.set(response.data);
        this.filterRooms();
      } else {
        this.errorMessage.set('Invalid response format');
      }
      this.isLoading.set(false);
    },
    error: (error) => {
      console.error('Failed to load rooms:', error);
      this.errorMessage.set('Failed to load rooms: ' + (error.message || 'Unknown error'));
      this.isLoading.set(false);
    }
  });
}
```

### Template with Loading State
```html
@if (isLoading()) {
  <div class="bg-blue-50 p-4 rounded">Loading rooms...</div>
} @else if (errorMessage()) {
  <div class="bg-red-50 p-4 rounded">{{ errorMessage() }}</div>
} @else {
  <!-- Table with rooms -->
}
```

---

## Next Steps

1. **Immediate**: Implement the service methods for each CRUD component
2. **Short-term**: Update components to use real API calls
3. **Testing**: Test all CRUD operations with the backend
4. **Optimization**: Add caching for frequently accessed data
5. **Features**: Add bulk operations, search optimization, pagination

---

## Troubleshooting

### Issue: Components still showing mock data
**Solution**: Verify that the `loadData()` method is calling the service instead of setting mock data directly

### Issue: API calls failing with 401
**Solution**: Check that the JWT token is being sent in the Authorization header. The AuthService should handle this automatically.

### Issue: Data not updating in table
**Solution**: Verify that `filterItems()` is being called after the API response to update the filtered data

### Issue: Modal not closing after save
**Solution**: Ensure `closeModal()` is called in the `next:` callback of the service subscription, not immediately

---

## Performance Tips

1. **Use OnDestroy to unsubscribe**: Prevent memory leaks with proper subscription management
2. **Implement pagination**: Load data in chunks instead of all at once
3. **Add search debouncing**: Delay API calls while user is typing
4. **Cache frequently accessed data**: Store data locally when appropriate
5. **Show loading skeletons**: Improve perceived performance with placeholder content

