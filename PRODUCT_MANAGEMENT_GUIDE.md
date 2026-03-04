# Product Management & Backend Integration Guide

## Overview
The shopping component now connects to the backend API to fetch real products with images instead of using hardcoded sample data.

## Backend API Endpoints

### Get All Products
```
GET /api/products?page=1&limit=20&category={category}&search={query}
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "product123",
      "name": "Premium Winter Jacket",
      "description": "High-quality winter jacket...",
      "price": 45.99,
      "originalPrice": 89.99,
      "category": "Adult Wears",
      "categoryId": "adult-wear",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
        "https://example.com/image3.jpg"
      ],
      "thumbnail": "https://example.com/image1.jpg",
      "icon": "🧥",
      "rating": 4.8,
      "reviews": 2345,
      "sold": 5200,
      "discount": 49,
      "inStock": true,
      "isFreeShipping": true,
      "stock": 150,
      "vendorId": "vendor123",
      "vendorType": "retail"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

### Get Product by ID
```
GET /api/products/{productId}
```

### Get Products by Category
```
GET /api/products/category/{categoryId}?page=1&limit=20
```

### Search Products
```
GET /api/products/search?q={query}&page=1&limit=20
```

### Get Trending Products
```
GET /api/products/trending?limit=10
```

### Get Featured Products
```
GET /api/products/featured?limit=10
```

## Creating Products from Admin/Vendor Dashboard

### Create Product
```
POST /api/products
Headers: {
  "Content-Type": "application/json",
  "x-user-id": "{userId}",
  "x-vendor-id": "{vendorId}"
}

Body: {
  "name": "Product Name",
  "description": "Product description",
  "price": 45.99,
  "originalPrice": 89.99,
  "category": "Adult Wears",
  "categoryId": "adult-wear",
  "images": ["url1", "url2", "url3"],
  "thumbnail": "url1",
  "icon": "🧥",
  "rating": 4.8,
  "reviews": 0,
  "sold": 0,
  "discount": 49,
  "inStock": true,
  "isFreeShipping": true,
  "stock": 150,
  "sku": "SKU123"
}
```

### Update Product
```
PUT /api/products/{productId}
Headers: {
  "Content-Type": "application/json",
  "x-user-id": "{userId}",
  "x-vendor-id": "{vendorId}"
}

Body: { /* same as create */ }
```

### Delete Product
```
DELETE /api/products/{productId}
Headers: {
  "x-user-id": "{userId}",
  "x-vendor-id": "{vendorId}"
}
```

### Upload Product Image
```
POST /api/products/upload-image
Headers: {
  "x-user-id": "{userId}",
  "x-vendor-id": "{vendorId}"
}

Body: FormData with 'image' file

Response:
{
  "success": true,
  "data": {
    "imageUrl": "https://example.com/uploaded-image.jpg"
  }
}
```

## Product Properties Explained

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| name | string | ✓ | Product name (max 100 chars) |
| description | string | ✓ | Detailed product description |
| price | number | ✓ | Current selling price |
| originalPrice | number | ✓ | Original/list price for discount calculation |
| category | string | ✓ | Category name (Adult Wears, Children Wears, etc.) |
| categoryId | string | ✓ | Category ID reference |
| images | string[] | ✓ | Array of product image URLs (recommended: 3-5 images) |
| thumbnail | string | - | Main product image URL (uses images[0] if not provided) |
| icon | string | - | Fallback emoji if images fail to load |
| rating | number | - | Average rating (0-5) |
| reviews | number | - | Total number of reviews |
| sold | number | - | Units sold |
| discount | number | - | Discount percentage (calculated if omitted: (originalPrice - price) / originalPrice * 100) |
| inStock | boolean | ✓ | Stock availability |
| isFreeShipping | boolean | - | Free shipping eligibility (default: false) |
| stock | number | ✓ | Available quantity |
| sku | string | - | Stock Keeping Unit |
| vendorId | string | - | Associated vendor ID |
| vendorType | string | - | Vendor type (retail, restaurant, hotel, etc.) |

## Image Requirements

### Image Format
- **Formats:** JPG, PNG, WebP
- **Max Size:** 5MB per image
- **Dimensions:** Recommended 500x500px minimum for product images
- **For thumbnails:** 400x400px is optimal
- **Multiple variants:** Upload 3-5 images showing different angles/colors

### Image Upload Process
1. **Select Image:** Use file input to select image from device
2. **Upload:** POST to `/api/products/upload-image`
3. **Get URL:** Backend returns image URL
4. **Add to Product:** Include URL in product's `images` array

### Image URL Handling in Frontend
The shopping component automatically:
- Detects if image is a URL (starts with 'http')
- Displays real images using `<img>` tags
- Falls back to emoji if URL fails to load
- Supports both real images and emoji variants

## Frontend Integration

### Shopping Component
```typescript
// Automatically loads products from backend on component init
ngOnInit() {
  this.loadProducts(); // Fetches from /api/products
}

// Convert API response to frontend format
convertApiProductToProduct(apiProduct) {
  return {
    id: apiProduct._id,
    name: apiProduct.name,
    images: apiProduct.images,
    price: apiProduct.price,
    // ... other properties
  }
}

// Filter and sort handled by frontend
filteredProducts = this.allProducts().filter(p => 
  p.name.includes(searchQuery)
).sort(...);
```

### Product Display
Products display with:
- Real images if available (preferred)
- Emoji fallback if images fail
- Flash animation effects on product cards
- Image gallery in quick view modal
- Thumbnails for image selection

## Sample Product Data

### Example 1: Clothing Item
```json
{
  "name": "Premium Winter Jacket",
  "description": "High-quality waterproof winter jacket with insulated lining. Perfect for cold weather.",
  "price": 45.99,
  "originalPrice": 89.99,
  "category": "Adult Wears",
  "categoryId": "adult-wear",
  "images": [
    "https://example.com/jacket-blue.jpg",
    "https://example.com/jacket-black.jpg",
    "https://example.com/jacket-red.jpg"
  ],
  "thumbnail": "https://example.com/jacket-blue.jpg",
  "icon": "🧥",
  "inStock": true,
  "stock": 150,
  "isFreeShipping": true,
  "discount": 49,
  "rating": 4.8,
  "reviews": 2345,
  "sold": 5200
}
```

### Example 2: Jewelry Item
```json
{
  "name": "Gold Diamond Necklace",
  "description": "18K gold plated necklace with cubic zirconia diamonds. Elegant design for all occasions.",
  "price": 18.99,
  "originalPrice": 89.99,
  "category": "Jewelry",
  "categoryId": "jewelry",
  "images": [
    "https://example.com/necklace-main.jpg",
    "https://example.com/necklace-side.jpg",
    "https://example.com/necklace-detail.jpg"
  ],
  "icon": "⛓️",
  "inStock": true,
  "stock": 80,
  "isFreeShipping": true,
  "discount": 79,
  "rating": 4.9,
  "reviews": 3456,
  "sold": 6700
}
```

## Error Handling

### Backend Connection Fails
- Component shows error message
- Loads fallback sample products
- User can still browse with limited data

### Image Fails to Load
- Shows fallback emoji from `icon` property
- Continues to display product info
- Doesn't block product display

### No Products Found
- Displays "No products found" message
- Suggests adjusting filters/search
- Shows helpful emoji (🔍)

## Testing

### Test Backend Integration
1. Ensure backend is running on `http://localhost:5000`
2. Products endpoint: `GET http://localhost:5000/api/products`
3. Check browser console for API errors
4. Verify products load in shopping page

### Test Image Display
1. Upload product with real image URLs
2. Verify images display in product cards
3. Test quick view image gallery
4. Test image fallback with missing images

### Test Filtering/Sorting
1. Search for products by name
2. Filter by category
3. Sort by price, rating, popularity
4. Verify all results update correctly

## Migration Notes

### From Sample Data to Real Data
1. ✓ ProductService created to handle API calls
2. ✓ ShoppingComponent updated to use ProductService
3. ✓ Image display supports both URLs and emojis
4. ✓ Fallback to sample data if backend unavailable
5. ⏳ Backend endpoints need to be implemented
6. ⏳ Admin dashboard product creation UI needed

## Next Steps

1. **Backend Implementation:**
   - Create `/api/products` endpoints
   - Implement product database schema
   - Add image upload endpoint
   - Set up product filtering/search

2. **Admin Dashboard:**
   - Create product creation form
   - Add image upload UI
   - Implement product management CRUD
   - Add product listing/editing

3. **Vendor Dashboards:**
   - Allow vendors to create products
   - Filter products by vendor
   - Product analytics/metrics

4. **Enhancement:**
   - Product reviews/ratings system
   - Product recommendations
   - Stock management
   - Inventory alerts
