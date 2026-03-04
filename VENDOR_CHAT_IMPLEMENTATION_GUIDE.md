# Vendor Chat Implementation Guide

## Overview
A shared **VendorChatSupportComponent** has been created at:
```
src/app/pages/vendor/vendor-chat-support/vendor-chat-support.component.ts
```

This component allows vendors to chat with their customers about bookings/orders.

## How to Add Chat to Each Vendor Dashboard

### Step 1: Import the Component
Add this import at the top of each dashboard component:
```typescript
import { VendorChatSupportComponent } from '../../vendor-chat-support/vendor-chat-support.component';
```

### Step 2: Add to Imports Array
Add `VendorChatSupportComponent` to the `imports` array in the `@Component` decorator:
```typescript
imports: [
  CommonModule,
  FormsModule,
  // ... other imports ...
  VendorChatSupportComponent  // Add this
]
```

### Step 3: Add Chat Condition in Template
Add a chat case in the main content area where other pages are rendered:
```html
} @else if (currentPage() === 'chat') {
  <app-vendor-chat-support
    [vendorId]="vendorId()"
    [vendorType]="vendorType()"
    [vendorName]="businessName()">
  </app-vendor-chat-support>
```

### Step 4: Add Chat Route
Add chat to the `onMenuItemSelected` route mapping:
```typescript
const routes: Record<string, string> = {
  // ... existing routes ...
  'chat': '/vendor-dashboard/{type}/chat'  // Replace {type} with actual vendor type
};
```

### Step 5: Add vendorId and vendorType Signals
Add these signals to your dashboard component class:
```typescript
vendorId = signal<string>(localStorage.getItem('hotelId') || '');  // or restaurantId, storeId, etc.
vendorType = signal<string>('hotel');  // or 'restaurant', 'tour', 'delivery', etc.
```

## Dashboards to Update

1. **Hotel Dashboard**
   - File: `src/app/pages/vendor/dashboards/hotel-dashboard/hotel-dashboard.component.ts`
   - vendorId: `localStorage.getItem('hotelId')`
   - vendorType: `'hotel'`
   - Route: `/vendor-dashboard/hotel/chat`

2. **Restaurant Dashboard** (if exists)
   - File: `src/app/pages/vendor/dashboards/restaurant-dashboard/restaurant-dashboard.component.ts`
   - vendorId: `localStorage.getItem('restaurantId')`
   - vendorType: `'restaurant'`
   - Route: `/vendor-dashboard/restaurant/chat`

3. **Retail Dashboard** (if exists)
   - File: `src/app/pages/vendor/dashboards/retail-dashboard/retail-dashboard.component.ts`
   - vendorId: `localStorage.getItem('storeId')`
   - vendorType: `'retail'`
   - Route: `/vendor-dashboard/retail/chat`

4. **Service Dashboard** (if exists)
   - File: `src/app/pages/vendor/dashboards/service-dashboard/service-dashboard.component.ts`
   - vendorId: `localStorage.getItem('serviceId')`
   - vendorType: `'service'`
   - Route: `/vendor-dashboard/service/chat`

5. **Tours Dashboard**
   - File: `src/app/pages/vendor/dashboards/tour-dashboard/tour-dashboard.component.ts`
   - vendorId: `localStorage.getItem('agencyId')`
   - vendorType: `'tour'`
   - Route: `/vendor-dashboard/tours/chat`

6. **Delivery Dashboard**
   - File: `src/app/pages/vendor/dashboards/delivery-dashboard/delivery-dashboard.component.ts`
   - vendorId: `localStorage.getItem('deliveryId')`
   - vendorType: `'delivery'`
   - Route: `/vendor-dashboard/delivery/chat`

## Backend Endpoints Required

The VendorChatSupportComponent uses these endpoints:
```
GET  /api/chat/vendor-chats/{vendorId}?vendorType={type}
POST /api/chat/vendor-chats/{chatId}/vendor-reply
```

## Features

✅ View all customer chats with their bookings/orders
✅ Show customer name, email, and booking ID
✅ Send/receive real-time messages
✅ Chat status tracking (Open/Pending/Closed)
✅ Message timestamps
✅ Read/unread indicators
✅ Disable reply when chat is closed

## Component Inputs

```typescript
@Input() vendorId: string = '';        // Vendor/Business ID
@Input() vendorType: string = '';      // 'hotel', 'restaurant', 'tour', etc.
@Input() vendorName: string = '';      // Display name (e.g., "Grand Hotel")
```

## Example Implementation (Hotel)

```typescript
// In hotel-dashboard.component.ts

import { VendorChatSupportComponent } from '../../vendor-chat-support/vendor-chat-support.component';

@Component({
  selector: 'app-hotel-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    // ... other imports ...
    VendorChatSupportComponent
  ],
  template: `
    <!-- Existing content ... -->
    
    @else if (currentPage() === 'chat') {
      <app-vendor-chat-support
        [vendorId]="vendorId()"
        [vendorType]="'hotel'"
        [vendorName]="businessName()">
      </app-vendor-chat-support>
    }
  `
})
export class HotelDashboardComponent implements OnInit {
  vendorId = signal<string>(localStorage.getItem('hotelId') || '');
  vendorType = signal<string>('hotel');
  
  onMenuItemSelected(itemId: string): void {
    this.currentPage.set(itemId);
    const routes: Record<string, string> = {
      // ... existing routes ...
      'chat': '/vendor-dashboard/hotel/chat'
    };
    const route = routes[itemId];
    if (route) {
      this.router.navigate([route]);
    }
  }
}
```

## Next Steps

1. Update each vendor dashboard following the steps above
2. Test the chat functionality with sample conversations
3. Ensure the backend endpoints are implemented
4. Add a "Chat" menu item to each vendor dashboard sidebar
