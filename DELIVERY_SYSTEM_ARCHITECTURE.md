# Delivery System Architecture

## Overview
The delivery system consists of two main frontends (Vendor Dashboard and Admin Dashboard) that both connect to a shared backend delivery management system via the `/api/delivery-admin` API.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Angular)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  VENDOR SIDE                          │          ADMIN SIDE            │
│  ────────────────────────────────     │    ──────────────────────    │
│                                       │                               │
│  Delivery Dashboard                   │    Admin Delivery Component   │
│  ├─ Orders Page                      │    ├─ Partners Tab           │
│  ├─ Couriers Page                    │    │  (Create, Verify)      │
│  ├─ Tracking Page                    │    │                         │
│  ├─ Analytics Page                   │    └─ Zones Tab             │
│  └─ Settings Page                    │       (Create, Configure)   │
│       └─ Delivery Partner Selection  │                               │
│                                       │                               │
└─────────────────────────────────────────────────────────────────────────┘
                    │                                   │
                    │                                   │
                    └───────────────────┬───────────────┘
                                        │
                    DeliveryService (Wrapper)
                    
┌─────────────────────────────────────────────────────────────────────────┐
│                         SHARED BACKEND API                              │
│                    /api/delivery-admin (Main Endpoint)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  DeliveryAdminController                                              │
│  ├─ Partner Management                                               │
│  │  ├─ GET /partners           → List all partners                  │
│  │  ├─ POST /partners          → Create partner                     │
│  │  └─ PATCH /partners/:id/verify → Verify partner                  │
│  │                                                                   │
│  ├─ Zone Management                                                 │
│  │  ├─ GET /zones             → List all zones                     │
│  │  ├─ POST /zones            → Create zone                        │
│  │  └─ PUT /zones/:id         → Update zone                        │
│  │                                                                   │
│  ├─ Provider Configuration (For Vendors)                            │
│  │  ├─ GET /config/:providerId         → Get vendor's config       │
│  │  ├─ POST /config/:providerId/select-partner → Add partner       │
│  │  ├─ DELETE /config/:providerId/partner/:partnerId → Remove      │
│  │  └─ PATCH /config/:providerId/default-partner/:partnerId → Set  │
│  │                                                                   │
│  ├─ Delivery Management (For Orders)                                │
│  │  ├─ GET /deliveries        → List all deliveries                │
│  │  ├─ PATCH /deliveries/:id/status → Update status                │
│  │  └─ POST /calculate-cost   → Calculate delivery cost             │
│  │                                                                   │
│  └─ Analytics                                                       │
│     └─ GET /analytics         → Dashboard statistics                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE (MongoDB)                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Collections:                                                         │
│  ├─ DeliveryPartner      (Admin creates/manages partners)           │
│  ├─ DeliveryZone         (Admin creates/manages zones)              │
│  ├─ DeliveryConfiguration (Vendors select partners)                 │
│  ├─ Delivery             (Tracks individual deliveries)             │
│  ├─ User                 (Vendor & Admin accounts)                  │
│  └─ Organization         (For admin organization management)         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Admin Setup (One-Time Setup by Admin)
```
Admin Dashboard
    │
    ├─→ [Partners Tab] → Add delivery company (e.g., FastDeliver Inc)
    │   └─→ POST /api/delivery-admin/partners
    │       └─→ Creates DeliveryPartner document
    │
    └─→ [Zones Tab] → Define delivery zones (e.g., New York, LA)
        └─→ POST /api/delivery-admin/zones
            └─→ Creates DeliveryZone with pricing rules
```

### 2. Vendor Configuration (Vendors Select Partners)
```
Vendor Dashboard → Settings/Delivery
    │
    └─→ Calls DeliveryService.getDeliveryPartners()
        └─→ GET /api/delivery-admin/partners?status=active
            └─→ Lists all active delivery partners
    
    │
    └─→ Vendor clicks "Add Partner" → Selects multiple partners
        └─→ POST /api/delivery-admin/config/:vendorId/select-partner
            └─→ Creates/Updates DeliveryConfiguration
                ├─ selectedDeliveryPartners: [partner1, partner2, ...]
                └─ isDefault: marks which partner is default
```

### 3. Vendor Dashboard Operations
```
Vendor Delivery Dashboard
    │
    ├─→ [Orders Page] → View all orders
    │   └─→ GET /api/delivery-admin/deliveries?page=1&limit=10
    │       └─→ Returns list of Delivery documents
    │
    ├─→ [Analytics] → View stats
    │   └─→ GET /api/delivery-admin/analytics
    │       └─→ Returns totalDeliveries, successfulDeliveries, avg time, etc.
    │
    └─→ [Couriers] → Manage delivery personnel
        └─→ GET /api/delivery-admin/couriers
            └─→ Returns list of couriers (if using legacy API)
```

### 4. Cost Calculation (When Creating Order)
```
Frontend (checkout/order creation)
    │
    └─→ Calls DeliveryService.calculateDeliveryCost({
            zoneId, distance, weight, deliveryType, providerId
        })
        └─→ POST /api/delivery-admin/calculate-cost
            └─→ Backend calculation:
                1. Get DeliveryZone pricing rules
                2. Get DeliveryConfiguration for vendor
                3. Get partner surcharges
                4. Calculate: baseCost + distanceFee + surcharge
                5. Return: {baseCost, distanceFee, surcharge, total}
```

## Connection Points Summary

| Component | Endpoint | Purpose | Used By |
|-----------|----------|---------|---------|
| Partners Management | `/api/delivery-admin/partners` | CRUD delivery companies | Admin Dashboard |
| Zones Management | `/api/delivery-admin/zones` | CRUD delivery areas | Admin Dashboard |
| Provider Config | `/api/delivery-admin/config/:id` | Vendor selects partners | Vendor Dashboard |
| Deliveries List | `/api/delivery-admin/deliveries` | Show orders/deliveries | Vendor Dashboard |
| Analytics | `/api/delivery-admin/analytics` | Dashboard statistics | Vendor Dashboard |
| Cost Calculation | `/api/delivery-admin/calculate-cost` | Calculate delivery fee | Order Checkout |

## Key Models & Relationships

### DeliveryPartner (Admin Creates)
```typescript
{
  _id: ObjectId,
  name: string,              // e.g., "FastDeliver Inc"
  email: string,
  phone: string,
  status: 'pending-verification' | 'active' | 'rejected',
  isVerified: boolean,
  activeProviders: number,   // How many vendors use this partner
  ...capabilities
}
```

### DeliveryZone (Admin Creates)
```typescript
{
  _id: ObjectId,
  name: string,              // e.g., "New York Zone"
  location: { city, state, country },
  basePricing: {
    basePrice: { value: number, currency: string },
    minPrice: number
  },
  distancePricing: {
    enabled: boolean,
    pricePerKm: { value: number, currency: string }
  },
  availableDeliveryPartners: [partnerId1, partnerId2, ...]
}
```

### DeliveryConfiguration (Vendor Creates via Admin's Partners)
```typescript
{
  _id: ObjectId,
  vendorId: ObjectId,        // Reference to vendor User
  selectedDeliveryPartners: [
    {
      partnerId: ObjectId,   // Reference to DeliveryPartner
      isDefault: boolean,    // Mark as default choice
      priority: number
    }
  ],
  offerDelivery: boolean,    // Enable/disable delivery for this vendor
  ...settings
}
```

### Delivery (Tracks Individual Shipments)
```typescript
{
  _id: ObjectId,
  orderId: ObjectId,         // Link to order
  vendorId: ObjectId,
  deliveryPartnerId: ObjectId, // Which partner delivers
  status: 'pending' | 'confirmed' | 'picked-up' | 'in-transit' | 'delivered',
  customerName: string,
  pickupLocation: { address, coordinates },
  deliveryLocation: { address, coordinates },
  distance: { value, unit },
  estimatedTime: number,
  pricing: {
    baseRate, distanceCharge, weightCharge, totalPrice
  },
  tracking: {
    status, currentLocation, trackingHistory
  }
}
```

## Frontend Service (DeliveryService)

The `DeliveryService` acts as a wrapper around the `/api/delivery-admin` endpoints:

```typescript
// Admin/Provider Configuration Methods
getDeliveryPartners(): GET /api/delivery-admin/partners
getDeliveryConfig(providerId): GET /api/delivery-admin/config/:providerId
selectDeliveryPartner(providerId, partnerId, isDefault): POST /api/delivery-admin/config/:providerId/select-partner
removeDeliveryPartner(providerId, partnerId): DELETE /api/delivery-admin/config/:providerId/partner/:partnerId
setDefaultDeliveryPartner(providerId, partnerId): PATCH /api/delivery-admin/config/:providerId/default-partner/:partnerId

// Delivery Zone Methods
getDeliveryZones(): GET /api/delivery-admin/zones

// Cost Calculation
calculateDeliveryCost(params): POST /api/delivery-admin/calculate-cost

// Order/Delivery Methods
getOrders(page, limit, status): GET /api/delivery-admin/deliveries
getServiceStats(): GET /api/delivery-admin/analytics
```

## User Flow Example

### Admin Flow (Setup)
```
1. Admin logs in → Admin Dashboard
2. Goes to "🚚 Delivery" → Partners tab
3. Clicks "➕ Add Delivery Partner"
4. Enters: FastDeliver Inc, email, phone
5. Creates DeliveryPartner with status 'pending-verification'
6. Admin clicks "✅ Verify" on the new partner
7. Partner status changes to 'active'
8. Goes to "Zones" tab
9. Creates Zone: "New York" with pricing rules
10. Links available partners to the zone
```

### Vendor Flow (Select Partner)
```
1. Vendor logs in → Vendor Dashboard
2. Goes to Settings → Delivery Partner Selection
3. Clicks "✏️ Manage"
4. Modal opens showing all active DeliveryPartners
5. Checks boxes to select multiple partners (FastDeliver, QuickShip)
6. Clicks "✓ Confirm Selection"
7. POST /api/delivery-admin/config/:vendorId/select-partner
8. Checks "Set Default" on FastDeliver
9. DeliveryConfiguration updated with selected partners
```

### Customer Flow (Order Creation)
```
1. Customer adds items to cart
2. At checkout, selects delivery partner
   - Frontend loads vendor's DeliveryConfiguration
   - Shows list of selected partners (e.g., FastDeliver, QuickShip)
3. Selects delivery zone and date
4. Frontend calculates cost:
   - POST /api/delivery-admin/calculate-cost
   - {zoneId, distance, weight, partnerId}
5. Backend returns cost breakdown
6. Order created with selected deliveryPartnerId
7. Delivery document created for tracking
```

## Benefits of This Architecture

✅ **Separation of Concerns**
- Admin manages partners & zones
- Vendors select from available partners
- System automatically matches deliveries to partners

✅ **Scalability**
- Multiple vendors can share same partners
- Multiple partners can serve same zones
- Cost calculation is centralized and consistent

✅ **Flexibility**
- Vendors can offer different delivery options based on zones
- Partners can be enabled/disabled without affecting vendors
- Zone pricing can be adjusted dynamically

✅ **Single Source of Truth**
- All delivery logic in one endpoint (`/api/delivery-admin`)
- Both vendor and admin UIs use same backend
- Consistent data across the platform
