# Backend Setup Guide - Hotel Management System

This guide will help you set up the backend and seed sample data for the hotel dashboard.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## Step 1: Backend Setup

### 1.1 Install Dependencies (if not done)
```bash
cd backend
npm install
```

### 1.2 Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/markethub
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/markethub?retryWrites=true&w=majority

# Tuya IoT Configuration (Optional)
TUYA_ACCESS_KEY=uacrm8an77hjqghy7qug
TUYA_SECRET_KEY=59c473f01d2f4ca3ba7cb77ccd258661
TUYA_REGION=https://openapi.tuyaeu.com
```

### 1.3 Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas:**
No action needed - update `MONGODB_URI` in `.env`

## Step 2: Seed Sample Data

Run the seed script to populate the database with sample data:

```bash
npm run seed
```

This will create:
- ✅ 1 Hotel (Grand Plaza Hotel)
- ✅ 10 Rooms (various types and statuses)
- ✅ 3 Bookings (with different statuses)
- ✅ 5 Staff Members
- ✅ 3 Maintenance Requests
- ✅ 2 Invoices
- ✅ 6 Room Service Menu Items
- ✅ 3 Menus (Breakfast, Lunch, Dinner)
- ✅ 3 Food Orders
- ✅ 5 Devices (Motion Sensors, Smart Lock, Thermostat, Camera)

**Output Example:**
```
✨ Database seeding completed successfully!

📊 Summary:
   - Hotels: 1
   - Rooms: 10
   - Bookings: 3
   - Staff: 5
   - Maintenance Requests: 3
   - Invoices: 2
   - Room Service Items: 6
   - Menus: 3
   - Food Orders: 3
   - Devices: 5

🏨 Hotel ID for API calls: 507f1f77bcf86cd799439011

Save this ID in localStorage or environment variables!
```

## Step 3: Start the Backend Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## Step 4: Configure Frontend

### 4.1 Update Hotel Service

In `src/app/services/hotel.service.ts`, update the hotel ID:

```typescript
private hotelId = '507f1f77bcf86cd799439011'; // Replace with your hotel ID from seeding
```

**OR** Set it dynamically from localStorage:

```typescript
setHotelId(id?: string) {
  if (id) {
    this.hotelId = id;
  } else {
    const storedHotelId = localStorage.getItem('hotelId');
    if (storedHotelId) {
      this.hotelId = storedHotelId;
    }
  }
}
```

### 4.2 Update Components to Use HotelService

Example for Rooms Component:

```typescript
import { HotelService } from '../../../../services/hotel.service';

export class RoomsComponent implements OnInit {
  rooms = signal<Room[]>([]);
  filteredRooms = signal<Room[]>([]);
  // ... other properties

  constructor(private hotelService: HotelService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.hotelService.getRooms(1, 10).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.rooms.set(response.data);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
        // Fallback to mock data if needed
        this.loadMockData();
      }
    });
  }

  saveRoom(): void {
    if (!this.formData.number || !this.formData.type) {
      alert('Please fill in all required fields');
      return;
    }

    const current = this.rooms();
    const id = this.editingId();

    const roomData = {
      roomNumber: this.formData.number,
      roomType: this.formData.type,
      capacity: this.formData.capacity,
      pricePerNight: this.formData.price,
      status: this.formData.status
    };

    if (id) {
      // Update existing room
      this.hotelService.updateRoom(id, roomData).subscribe({
        next: () => this.loadRooms(),
        error: (error) => console.error('Error updating room:', error)
      });
    } else {
      // Create new room
      this.hotelService.createRoom(roomData).subscribe({
        next: () => this.loadRooms(),
        error: (error) => console.error('Error creating room:', error)
      });
    }

    this.closeForm();
  }

  deleteRoom(id: string): void {
    if (confirm('Are you sure you want to delete this room?')) {
      this.hotelService.deleteRoom(id).subscribe({
        next: () => this.loadRooms(),
        error: (error) => console.error('Error deleting room:', error)
      });
    }
  }
}
```

## Available API Endpoints

### Hotels
- `GET /api/hotels` - List all hotels
- `POST /api/hotels` - Create hotel
- `GET /api/hotels/:id` - Get hotel details
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Rooms
- `GET /api/hotels/:hotelId/rooms` - List rooms
- `POST /api/hotels/:hotelId/rooms` - Create room
- `GET /api/hotels/:hotelId/rooms/:id` - Get room
- `PUT /api/hotels/:hotelId/rooms/:id` - Update room
- `PUT /api/hotels/:hotelId/rooms/:id/status` - Update room status
- `DELETE /api/hotels/:hotelId/rooms/:id` - Delete room

### Bookings
- `GET /api/hotels/:hotelId/bookings` - List bookings
- `POST /api/hotels/:hotelId/bookings` - Create booking
- `GET /api/hotels/:hotelId/bookings/:id` - Get booking
- `PUT /api/hotels/:hotelId/bookings/:id` - Update booking
- `PUT /api/hotels/:hotelId/bookings/:id/status` - Update booking status
- `PUT /api/hotels/:hotelId/bookings/:id/payment-status` - Update payment status
- `DELETE /api/hotels/:hotelId/bookings/:id` - Delete booking

### Staff
- `GET /api/hotels/:hotelId/staff` - List staff
- `POST /api/hotels/:hotelId/staff` - Create staff
- `GET /api/hotels/:hotelId/staff/:id` - Get staff
- `PUT /api/hotels/:hotelId/staff/:id` - Update staff
- `DELETE /api/hotels/:hotelId/staff/:id` - Delete staff

### Maintenance
- `GET /api/hotels/:hotelId/maintenance` - List maintenance requests
- `POST /api/hotels/:hotelId/maintenance` - Create request
- `GET /api/hotels/:hotelId/maintenance/:id` - Get request
- `PUT /api/hotels/:hotelId/maintenance/:id` - Update request
- `PUT /api/hotels/:hotelId/maintenance/:id/status` - Update status
- `DELETE /api/hotels/:hotelId/maintenance/:id` - Delete request

### Invoices
- `GET /api/hotels/:hotelId/invoices` - List invoices
- `POST /api/hotels/:hotelId/invoices` - Create invoice
- `GET /api/hotels/:hotelId/invoices/:id` - Get invoice
- `PUT /api/hotels/:hotelId/invoices/:id` - Update invoice
- `PUT /api/hotels/:hotelId/invoices/:id/status` - Update status
- `DELETE /api/hotels/:hotelId/invoices/:id` - Delete invoice

### Food Orders
- `GET /api/hotels/:hotelId/food-orders` - List orders
- `POST /api/hotels/:hotelId/food-orders` - Create order
- `GET /api/hotels/:hotelId/food-orders/:id` - Get order
- `PUT /api/hotels/:hotelId/food-orders/:id` - Update order
- `PUT /api/hotels/:hotelId/food-orders/:id/status` - Update status
- `DELETE /api/hotels/:hotelId/food-orders/:id` - Delete order

### Menus
- `GET /api/hotels/:hotelId/menus` - List menus
- `POST /api/hotels/:hotelId/menus` - Create menu
- `GET /api/hotels/:hotelId/menus/:id` - Get menu
- `PUT /api/hotels/:hotelId/menus/:id` - Update menu
- `PUT /api/hotels/:hotelId/menus/:id/toggle-active` - Toggle menu active status
- `DELETE /api/hotels/:hotelId/menus/:id` - Delete menu

### Room Service
- `GET /api/hotels/:hotelId/room-service` - List items
- `POST /api/hotels/:hotelId/room-service` - Create item
- `GET /api/hotels/:hotelId/room-service/:id` - Get item
- `PUT /api/hotels/:hotelId/room-service/:id` - Update item
- `DELETE /api/hotels/:hotelId/room-service/:id` - Delete item

### Devices
- `GET /api/devices` - List devices
- `POST /api/devices` - Register devices
- `GET /api/devices/:id` - Get device
- `PUT /api/devices/:id` - Update device
- `PUT /api/devices/:id/status` - Update device status
- `POST /api/devices/remove` - Delete devices (batch)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network connectivity for MongoDB Atlas

### CORS Error
- Backend already has CORS configured
- Ensure frontend is running on `localhost:4200`

### Hotel ID Not Found
- Run seed script again: `npm run seed`
- Copy the Hotel ID from the output
- Update it in `hotel.service.ts`

### Port Already in Use
- Change the PORT in `.env`
- Or kill the process: `lsof -i :5000` then `kill -9 <PID>`

## Next Steps

1. Run the seed script to create sample data
2. Update frontend components to use HotelService
3. Test API endpoints using Postman or curl
4. Connect additional features as needed

---

For more details on the Hotel Management API, check the backend README.md
