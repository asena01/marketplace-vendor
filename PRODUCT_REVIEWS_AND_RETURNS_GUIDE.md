# Product Reviews and Returns System Guide

## Overview

The marketplace now includes two key customer features:
1. **Product Reviews** - Customers can rate and review products
2. **Product Returns** - Customers can request returns/refunds for products

## Product Reviews System

### Feature Overview

Customers can:
- Leave star ratings (1-5 stars)
- Write review titles and detailed comments
- View other customers' reviews
- Mark reviews as helpful

Reviews are displayed:
- In the product Quick View modal
- Can be filtered and sorted
- Show verified purchase badges
- Display customer name and date

### Backend API Endpoints

#### Get Product Reviews
```
GET /api/reviews/product/{productId}?page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "review123",
      "productId": "product456",
      "customerId": "customer789",
      "customerName": "John Doe",
      "customerEmail": "john@example.com",
      "rating": 5,
      "title": "Excellent Quality",
      "comment": "This product exceeded my expectations. Highly recommended!",
      "images": ["url1", "url2"],
      "helpful": 24,
      "verified": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

#### Create Review
```
POST /api/reviews
Headers: {
  "x-user-id": "{userId}",
  "Content-Type": "application/json"
}

Body: {
  "productId": "product456",
  "rating": 5,
  "title": "Excellent Quality",
  "comment": "This product exceeded my expectations...",
  "images": ["url1", "url2"]
}
```

#### Get Customer's Reviews
```
GET /api/reviews/customer/{customerId}?page=1&limit=10
Headers: {
  "x-user-id": "{customerId}"
}
```

#### Update Review
```
PUT /api/reviews/{reviewId}
Headers: {
  "x-user-id": "{customerId}"
}

Body: {
  "rating": 4,
  "title": "Good",
  "comment": "Updated comment..."
}
```

#### Delete Review
```
DELETE /api/reviews/{reviewId}
Headers: {
  "x-user-id": "{customerId}"
}
```

#### Mark Review Helpful
```
POST /api/reviews/{reviewId}/helpful
Headers: {
  "x-user-id": "{customerId}"
}
```

#### Get Product Rating Summary
```
GET /api/reviews/product/{productId}/rating

Response:
{
  "success": true,
  "data": {
    "rating": 4.7,
    "reviewCount": 150
  }
}
```

### Frontend Integration

#### Review Form in Quick View Modal
```
- Star rating selector (1-5 stars)
- Review title input (text field)
- Detailed comment textarea
- Submit and cancel buttons
- Loading state during submission
```

#### Review Display
```
- Customer name with verified badge
- Star rating display
- Review title
- Full comment text
- Helpful button
- Posted date
```

### Review Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| productId | string | ✓ | Product being reviewed |
| rating | number | ✓ | 1-5 star rating |
| title | string | ✓ | Short review summary |
| comment | string | ✓ | Detailed review text |
| images | string[] | - | Review photos |
| verified | boolean | - | Verified purchase badge |
| helpful | number | - | Number of helpful votes |
| customerId | string | - | Auto-filled from session |
| customerName | string | - | Auto-filled from session |

## Product Returns System

### Feature Overview

Customers can:
- Request product returns/refunds
- Select return reason from predefined list
- Provide detailed description
- Upload product images
- Track return status
- Download return shipping labels

Return statuses:
- **pending** - Awaiting admin review
- **approved** - Admin approved, customer ships item back
- **rejected** - Admin rejected the return
- **shipped** - Item in transit back to warehouse
- **received** - Warehouse received item
- **completed** - Refund processed

### Backend API Endpoints

#### Get Customer's Returns
```
GET /api/returns/customer/{customerId}?page=1&limit=10
Headers: {
  "x-user-id": "{customerId}"
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "return123",
      "orderId": "order456",
      "productId": "product789",
      "customerId": "customer999",
      "customerName": "Jane Doe",
      "reason": "Defective",
      "description": "Product stopped working after 2 days of use",
      "refundAmount": 45.99,
      "returnStatus": "shipped",
      "trackingNumber": "TR123456789",
      "shippingLabel": "https://example.com/label.pdf",
      "images": ["url1"],
      "adminNotes": "Item received and inspection completed",
      "createdAt": "2024-01-20T14:30:00Z"
    }
  ]
}
```

#### Create Return Request
```
POST /api/returns
Headers: {
  "x-user-id": "{customerId}",
  "Content-Type": "application/json"
}

Body: {
  "orderId": "order456",
  "productId": "product789",
  "reason": "Defective",
  "description": "Detailed reason for return...",
  "images": ["url1", "url2"]
}
```

#### Get Return Details
```
GET /api/returns/{returnId}
Headers: {
  "x-user-id": "{customerId}"
}
```

#### Update Return Status (Admin Only)
```
PUT /api/returns/{returnId}/status
Headers: {
  "x-user-id": "{adminId}",
  "x-admin-role": "admin"
}

Body: {
  "returnStatus": "approved",
  "adminNotes": "Approved for return. Shipping label generated."
}
```

#### Cancel Return
```
POST /api/returns/{returnId}/cancel
Headers: {
  "x-user-id": "{customerId}"
}
```

#### Get Return Reasons
```
GET /api/returns/reasons

Response:
{
  "success": true,
  "data": [
    "Defective",
    "Not as described",
    "Wrong item received",
    "Changed mind",
    "Size/fit issues",
    "Arrived damaged",
    "Quality issues"
  ]
}
```

#### Upload Return Images
```
POST /api/returns/upload-image
Headers: {
  "x-user-id": "{customerId}"
}

Body: FormData with 'image' file

Response:
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/return-image.jpg"
  }
}
```

### Return Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| orderId | string | ✓ | Order containing the item |
| productId | string | ✓ | Product being returned |
| reason | string | ✓ | Return reason |
| description | string | ✓ | Detailed explanation |
| refundAmount | number | ✓ | Refund amount |
| returnStatus | string | ✓ | Current return status |
| images | string[] | - | Photos of product |
| trackingNumber | string | - | Return shipping tracking |
| shippingLabel | string | - | PDF shipping label URL |
| adminNotes | string | - | Admin comments |
| customerId | string | - | Auto-filled from session |
| customerName | string | - | Auto-filled from session |

## Customer Interface

### Shopping Page - Product Review
Located in Quick View Modal:
```
Review Section:
├── Write Review Button
│   ├── Star Rating (1-5)
│   ├── Review Title Input
│   ├── Comment Textarea
│   └── Submit/Cancel Buttons
└── Customer Reviews List
    ├── Customer Name + Date
    ├── Rating Stars
    ├── Review Title
    ├── Review Comment
    └── Helpful Button
```

### Customer Dashboard - Returns Tab
Located in Customer Profile:
```
Returns Section:
├── Returns List
│   ├── Product ID
│   ├── Order ID
│   ├── Return Status Badge
│   ├── Reason & Description
│   ├── Refund Amount
│   └── Download Shipping Label (if applicable)
└── Empty State (if no returns)
```

## Implementation Checklist

### Backend Requirements
- [ ] Implement `/api/reviews` endpoints
  - [ ] GET all product reviews with pagination
  - [ ] POST create review (requires authentication)
  - [ ] PUT update review (own reviews only)
  - [ ] DELETE review (own reviews only)
  - [ ] POST mark helpful
  
- [ ] Implement `/api/returns` endpoints
  - [ ] GET customer returns
  - [ ] POST create return request
  - [ ] GET return details
  - [ ] PUT update status (admin only)
  - [ ] POST cancel return
  - [ ] GET return reasons
  - [ ] POST upload return image

### Frontend Features (✓ Completed)
- [x] Review service created
- [x] Return service created
- [x] Quick View Modal review section
- [x] Customer profile returns tab
- [x] Review submission form
- [x] Return tracking display

## Testing Guide

### Test Reviews
1. Open product Quick View modal
2. Click "✍️ Write Review" button
3. Fill in rating (click stars), title, and comment
4. Click "Submit Review"
5. Verify review appears in list

### Test Returns
1. Go to Customer Dashboard
2. Click "📦 Returns (N)" tab in profile
3. View return statuses and details
4. Download shipping label if available
5. Track refund status

### API Testing

**Create Review:**
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product123",
    "rating": 5,
    "title": "Great product",
    "comment": "Exceeded expectations"
  }'
```

**Create Return:**
```bash
curl -X POST http://localhost:5000/api/returns \
  -H "x-user-id: user123" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order123",
    "productId": "product456",
    "reason": "Defective",
    "description": "Product not working"
  }'
```

## Admin Features (Not Yet Implemented)

Future admin dashboard should include:
- [ ] View all product reviews
- [ ] Moderate/approve reviews
- [ ] Block spam reviews
- [ ] Manage return requests
- [ ] Update return status
- [ ] Generate shipping labels
- [ ] Process refunds
- [ ] Generate refund reports

## Error Handling

### Review Errors
- User not logged in → Show login prompt
- Missing fields → Show validation message
- Network error → Show retry button
- Submission failure → Show error message

### Return Errors
- User not logged in → Show login prompt
- Invalid order → Show error message
- Return window closed → Show message
- Upload failed → Show retry
- Status update failed → Show error

## Future Enhancements

1. **Review Features:**
   - Photo upload for reviews
   - Review sorting (helpful, recent, rating)
   - Review filtering
   - Verified purchase badge automatic detection
   - Admin reply to reviews
   - Review moderation

2. **Return Features:**
   - Pre-filled return forms from order details
   - QR code on shipping labels
   - SMS/Email status notifications
   - Return window enforcement (30-days, 60-days, etc.)
   - Automatic refund processing
   - Return history analytics

3. **Analytics:**
   - Average product ratings dashboard
   - Return rate by product
   - Common return reasons report
   - Customer satisfaction metrics

## Sample Data

### Sample Review
```json
{
  "_id": "review_001",
  "productId": "prod_winter_jacket",
  "customerId": "cust_12345",
  "customerName": "Sarah Johnson",
  "customerEmail": "sarah@example.com",
  "rating": 5,
  "title": "Perfect Winter Jacket",
  "comment": "This jacket is amazing! Keeps me warm in harsh winter weather. The quality is excellent and it's very comfortable to wear.",
  "images": ["img_jacket_1.jpg", "img_jacket_2.jpg"],
  "helpful": 45,
  "verified": true,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Sample Return
```json
{
  "_id": "return_001",
  "orderId": "order_98765",
  "productId": "prod_summer_dress",
  "customerId": "cust_54321",
  "customerName": "Emily Chen",
  "reason": "Size/fit issues",
  "description": "The dress runs too small. I ordered size M but it fits like XS. Needs to exchange for size L.",
  "refundAmount": 28.99,
  "returnStatus": "approved",
  "trackingNumber": "FEDEX123456",
  "shippingLabel": "https://example.com/labels/return_001.pdf",
  "images": ["dress_photo.jpg"],
  "adminNotes": "Approved. Customer can exchange for size L when item is received.",
  "createdAt": "2024-01-20T14:30:00Z"
}
```
