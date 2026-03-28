# 🔌 Room-Device Connection Architecture

## Overview

This guide explains how hotel rooms and IoT devices are connected in the system, and how the connection flows through the application.

---

## 1. Database Schema Relationship

### One-to-Many Relationship
```
┌─────────────────────────┐
│        ROOM             │
│   _id: ObjectId         │
│   roomNumber: String    │
│   roomType: String      │
│   floor: Number         │
│   capacity: Number      │
│   hotel: Ref(Hotel)     │
└──────────────┬──────────┘
               │
               │ (via Device.room)
               │
               ▼
┌─────────────────────────────────┐
│        DEVICE                   │
│   _id: ObjectId                 │
│   deviceId: String              │
│   deviceType: String            │
│   room: Ref(Room) ← KEY FIELD   │
│   roomNumber: Number            │
│   status: Boolean               │
│   battery: Number               │
│   hotel: Ref(Hotel)             │
│   tuyaDeviceId: String          │
└─────────────────────────────────┘
```

### Key Connection Point
- **Device.room** is a MongoDB reference (ObjectId) that points to **Room._id**
- When you assign a device to a room: `device.room = room._id`
- This creates a searchable, indexed relationship

---

## 2. How Connection Works in Code

### Creating the Connection

```javascript
// Backend Controller Example
const device = await Device.findById(deviceId);
const room = await Room.findById(roomId);

// ASSIGN DEVICE TO ROOM
device.room = roomId;  // Set the reference
device.roomNumber = room.roomNumber;  // Store room number for quick access
await device.save();

// Result: Device is now linked to Room
```

### Querying Connected Devices

```javascript
// Find all devices in a room
const roomDevices = await Device.find({ room: roomId });

// Find devices of specific type in a room
const locks = await Device.find({ 
  room: roomId, 
  deviceType: 'smart_lock' 
});

// Populate room details when fetching devices
const device = await Device.findById(deviceId)
  .populate('room', 'roomNumber roomType floor');
```

---

## 3. Connection Flow Through the System

### Step 1: Hotel Admin Adds Devices
```
Admin Dashboard → Devices Page
  → Add Device → Device created with hotel reference
  → Device.hotel = hotelId
  → Device.room = null (initially unassigned)
```

### Step 2: Room-Device Assignment Page
```
Admin Dashboard → Room-Device Assignment
  → Display all rooms and unassigned devices
  → Select device → Select room → Click "Assign"
  → API Call: POST /hotels/:hotelId/device-assignments/:deviceId/assign/:roomId
  → Backend updates: device.room = roomId
```

### Step 3: Smart Lock Assignment for Check-In
```
Guest Books Room → Booking Confirmed
  → createSmartLockAccess() triggered
  → Looks up: Room → Find smartLockId
  → Generates: Access Token + PIN + QR Code
  → Stores in Booking.smartLockAccess
  → Device control via Tuya API
```

### Step 4: Data Display Throughout System

#### 4a. Room Details View
```
Shows:
- Room Information
- Assigned Devices List
  - Smart Lock Status
  - Motion Sensors
  - Thermostat Status
  - etc.
```

#### 4b. Device Monitoring
```
Shows:
- All Devices in Hotel
- Device Filter by Room
- Real-time Status from Connected Room
- Lock/Unlock Controls
```

#### 4c. Check-In Process
```
Guest Information:
- Room: 101
- Assigned Smart Lock Device: lock_room_101
- Lock Status: Online/Offline
- Battery Level
- Unlock Methods:
  - QR Code (links to device access)
  - PIN Code (device-specific)
```

---

## 4. Data Flow Diagram

```
┌──────────────────┐
│   ADMIN         │
│   Dashboard     │
└────────┬────────┘
         │
         │ 1. Adds Device
         │
         ▼
┌──────────────────────────┐
│   Device Collection      │
│  - device_101           │
│  - device_102           │
│  - device_201 (etc)     │
└────────┬────────────────┘
         │
         │ 2. Assigns to Room
         │    (sets Device.room)
         │
         ▼
┌──────────────────────────┐
│   Room Collection        │
│  - room_101 ←── linked   │
│  - room_102 ←── linked   │
│  - room_201 ←── linked   │
└────────┬────────────────┘
         │
         │ 3. On Guest Booking
         │
         ▼
┌──────────────────────────┐
│   Booking Collection     │
│  - smartLockAccess       │
│    └─ accessToken        │
│    └─ backupPin          │
│    └─ qrCode             │
└────────┬────────────────┘
         │
         │ 4. Guest Unlock
         │
         ▼
┌──────────────────────────┐
│   Tuya IoT Device        │
│  - Receives command      │
│  - Unlock executed       │
│  - Status updated        │
└──────────────────────────┘
```

---

## 5. API Endpoints for Connection Management

### Get All Device Assignments
```http
GET /hotels/:hotelId/device-assignments

Response:
{
  "status": "success",
  "data": {
    "assignmentMap": {
      "room_101": {
        "room": { ... },
        "devices": [ ... ]
      }
    },
    "unassignedDevices": [ ... ],
    "summary": {
      "totalDevices": 50,
      "assignedDevices": 45,
      "unassignedDevices": 5
    }
  }
}
```

### Assign Device to Room
```http
POST /hotels/:hotelId/device-assignments/:deviceId/assign/:roomId

Response:
{
  "status": "success",
  "message": "Device assigned to Room 101",
  "data": {
    "deviceId": "device_001",
    "deviceName": "lock_room_101",
    "roomId": "room_101",
    "roomNumber": "101"
  }
}
```

### Get Room Devices
```http
GET /hotels/:hotelId/rooms/:roomId/devices

Response:
{
  "status": "success",
  "data": {
    "room": {
      "roomNumber": "101",
      "roomType": "double",
      "capacity": 2
    },
    "devices": [
      {
        "deviceId": "lock_room_101",
        "deviceType": "smart_lock",
        "status": true,
        "battery": 85
      },
      {
        "deviceId": "motion_sensor_101",
        "deviceType": "motion_sensor",
        "status": true
      }
    ],
    "summary": {
      "totalDevices": 2,
      "activeDevices": 2,
      "deviceTypes": ["smart_lock", "motion_sensor"]
    }
  }
}
```

### Get Assignment Statistics
```http
GET /hotels/:hotelId/device-assignments/statistics

Response:
{
  "status": "success",
  "data": {
    "overview": {
      "totalDevices": 50,
      "assignedDevices": 45,
      "unassignedDevices": 5,
      "assignmentRate": 90,
      "totalRooms": 20,
      "roomsWithDevices": 18
    },
    "deviceTypeStats": {
      "smart_lock": { "total": 20, "assigned": 20 },
      "motion_sensor": { "total": 20, "assigned": 18 },
      "thermostat": { "total": 10, "assigned": 7 }
    }
  }
}
```

---

## 6. Frontend Components for Management

### Room-Device Assignment Component
Located at: `src/app/pages/vendors/dashboards/hotel-dashboard/room-device-assignment/`

**Features:**
- View all rooms and their assigned devices
- Assign unassigned devices to rooms
- Unassign devices from rooms
- Quick assign functionality
- Filter rooms by floor/number
- View device status and battery

**Route:** `/hotel-dashboard/device-assignment`

### Device Management Component
Located at: `src/app/pages/vendors/dashboards/hotel-dashboard/devices/`

**Features:**
- Monitor all devices
- View real-time device status
- Check device logs
- Motion detection analytics
- Filter by status, type, date range

**Route:** `/hotel-dashboard/devices`

### Room Details Component
Located at: `src/app/pages/vendors/dashboards/hotel-dashboard/rooms/`

**Features:**
- View room information
- See assigned devices
- Monitor device health
- Control locks (if authorized)

**Route:** `/hotel-dashboard/rooms`

---

## 7. Data Validation Rules

When connecting a room and device:

✅ **Valid:**
- Device exists and belongs to the hotel
- Room exists and belongs to the hotel
- One device can be assigned to one room
- Multiple devices can be assigned to one room
- One room can have multiple device types

❌ **Invalid:**
- Device from different hotel assigned to room
- Non-existent room ID
- Device already assigned (must unassign first)
- Invalid device type for room

---

## 8. Real-World Example: Guest Check-In Flow

### Scenario: Guest John Doe books Room 101

1. **Room Definition**
   ```
   Room 101 (double, 2 capacity)
   ```

2. **Devices Assigned to Room 101**
   ```
   Device 1: lock_room_101 (smart_lock) → Tuya ID: tuya_xyz_1
   Device 2: motion_sensor_101 (motion_sensor) → Tuya ID: tuya_xyz_2
   Device 3: thermostat_101 (thermostat) → Tuya ID: tuya_xyz_3
   ```

3. **Guest Books Room 101**
   ```
   POST /hotels/hotel_1/bookings
   {
     "guest": "john_doe_id",
     "room": "room_101",
     "checkInDate": "2024-01-15",
     "checkOutDate": "2024-01-17"
   }
   ```

4. **Booking Confirmed → Smart Lock Access Generated**
   ```
   POST /smart-lock/create-access/booking_123
   {
     "hotelId": "hotel_1",
     "sendEmail": true,
     "setupDevice": true
   }
   ```

5. **Smart Lock Service Executes:**
   - Looks up Room 101
   - Finds assigned smart lock: lock_room_101 (tuya_xyz_1)
   - Generates: accessToken + backupPin + QRCode
   - Calls Tuya API to add temporary PIN to device
   - Sends email to John with all access methods

6. **Guest Receives Email With:**
   - QR Code (scans to unlock)
   - Access Token (paste alternative)
   - Backup PIN (emergency access)
   - Instructions for each method

7. **Guest Arrives → Scans QR Code**
   - Frontend loads: `/unlock?token=accessToken`
   - User clicks "Unlock Room"
   - Backend validates token against booking
   - Backend calls Tuya API: unlock device tuya_xyz_1
   - Smart lock on Room 101 door opens
   - Access logged in system

8. **Check-Out → Access Automatically Revoked**
   - Booking.checkOutDate arrives
   - Access token expires
   - Temporary PIN removed from device
   - Device ready for next guest

---

## 9. Benefits of Room-Device Connection

✅ **For Hotel Staff:**
- Quick device assignment without manual tracking
- Easy device monitoring by room
- Automatic access setup for guests
- Device maintenance tracking per room

✅ **For Guests:**
- Seamless check-in without keys
- Multiple unlock methods (QR, PIN, token)
- Automatic access expiration
- Emergency backup options

✅ **For Management:**
- Complete device inventory
- Assignment rate tracking
- Device performance by room
- Maintenance scheduling

---

## 10. Troubleshooting Connection Issues

### Issue: Device not assigned to room
**Solution:** 
- Go to `/hotel-dashboard/device-assignment`
- Select device and click "Assign"
- Verify in room details view

### Issue: Smart lock not unlocking
**Solution:**
- Check device assignment (Room → Device)
- Check device online status
- Verify Tuya API credentials
- Check device battery level

### Issue: Guest not receiving unlock email
**Solution:**
- Verify email service configuration
- Check guest email in booking
- Verify smart lock setup enabled
- Check server logs for email errors

### Issue: Wrong device assigned to room
**Solution:**
- Click "✕" button to unassign
- Select correct device
- Click "Assign" button
- Verify in room device list

---

## Summary

The **Room-Device connection** is a one-to-many relationship where:
- **Rooms** have basic information (number, type, capacity)
- **Devices** have an optional `room` reference field
- **Assignment** is done via `/device-assignment` UI or API
- **Connection enables** smart lock automation, monitoring, and guest access
- **Data flows** from Device → Room → Booking → Guest Access

This architecture allows flexible device management, automatic guest access, and comprehensive monitoring across all hotel rooms.
