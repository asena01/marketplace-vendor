/**
 * Vendor Type Configuration
 * Defines vendor-specific settings, dashboard names, and product form fields
 */

export interface VendorTypeConfig {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  dashboardTitle: string;
  dashboardDescription: string;
  productLabel: string;
  categories: string[];
  productFields: ProductFieldConfig[];
  color: string;
  emoji: string;
}

export interface ProductFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'array' | 'multiselect' | 'section';
  required: boolean;
  placeholder?: string;
  options?: string[];
  group?: string; // For grouping related fields
}

export const VENDOR_TYPE_CONFIG: { [key: string]: VendorTypeConfig } = {
  retail: {
    id: 'retail',
    name: 'Retail',
    displayName: 'Retail Store',
    icon: 'shopping_cart',
    dashboardTitle: 'Retail Store Management',
    dashboardDescription: 'Manage products, inventory, orders, and customer interactions across your retail store.',
    productLabel: 'Product',
    color: 'from-green-600 to-green-700',
    emoji: '🛍️',
    categories: [
      'adult-wear',
      'children-wear',
      'jewelry',
      'supermarket',
      'furniture',
      'hair',
      'pets',
      'gym',
      'groceries'
    ],
    productFields: [
      { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Blue T-Shirt' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: false },
      { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '29.99' },
      { name: 'originalPrice', label: 'Original Price', type: 'number', required: false },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'sku', label: 'SKU', type: 'text', required: false },
      { name: 'images', label: 'Product Images', type: 'array', required: false },
      { name: 'size', label: 'Available Sizes', type: 'multiselect', required: false, group: 'Variants', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'] },
      { name: 'color', label: 'Available Colors', type: 'multiselect', required: false, group: 'Variants', options: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Navy'] },
      { name: 'material', label: 'Material', type: 'text', required: false, group: 'Details' },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Details' },
      { name: 'isFeatured', label: 'Featured Product', type: 'checkbox', required: false }
    ]
  },

  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    displayName: 'Restaurant',
    icon: 'restaurant',
    dashboardTitle: 'Restaurant Management',
    dashboardDescription: 'Manage menu items, orders, delivery, and dining service.',
    productLabel: 'Menu Item',
    color: 'from-orange-600 to-red-600',
    emoji: '🍽️',
    categories: [
      'appetizers',
      'main-course',
      'desserts',
      'beverages',
      'breakfast',
      'lunch',
      'dinner',
      'fast-food'
    ],
    productFields: [
      { name: 'name', label: 'Dish Name', type: 'text', required: true, placeholder: 'e.g., Grilled Salmon' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'stock', label: 'Portions Available', type: 'number', required: true },
      { name: 'images', label: 'Dish Images', type: 'array', required: true },
      { name: 'preparationTime', label: 'Preparation Time (min)', type: 'number', required: true, group: 'Details' },
      { name: 'servings', label: 'Servings', type: 'number', required: false, group: 'Details' },
      { name: 'spicyLevel', label: 'Spicy Level', type: 'select', required: false, options: ['Mild', 'Medium', 'Hot', 'Very Hot'], group: 'Details' },
      { name: 'ingredients', label: 'Main Ingredients', type: 'array', required: false, group: 'Details' },
      { name: 'allergens', label: 'Allergens', type: 'array', required: false, group: 'Details' },
      { name: 'isVegetarian', label: 'Vegetarian', type: 'checkbox', required: false, group: 'Dietary' },
      { name: 'isVegan', label: 'Vegan', type: 'checkbox', required: false, group: 'Dietary' },
      { name: 'isGlutenFree', label: 'Gluten-Free', type: 'checkbox', required: false, group: 'Dietary' },
      { name: 'isFeatured', label: 'Featured Item', type: 'checkbox', required: false }
    ]
  },

  hotel: {
    id: 'hotel',
    name: 'Hotel',
    displayName: 'Hotel/Accommodation',
    icon: 'hotel',
    dashboardTitle: 'Hotel Management',
    dashboardDescription: 'Manage rooms, bookings, amenities, and guest services.',
    productLabel: 'Room',
    color: 'from-purple-600 to-pink-600',
    emoji: '🏨',
    categories: [
      'single-room',
      'double-room',
      'suite',
      'deluxe',
      'penthouse',
      'apartment',
      'cottage',
      'dormitory'
    ],
    productFields: [
      { name: 'name', label: 'Room Name', type: 'text', required: true, placeholder: 'e.g., Deluxe Suite 301' },
      { name: 'category', label: 'Room Type', type: 'select', required: true },
      { name: 'description', label: 'Room Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price per Night', type: 'number', required: true },
      { name: 'stock', label: 'Number of Rooms', type: 'number', required: true },
      { name: 'images', label: 'Room Images', type: 'array', required: true },
      { name: 'capacity', label: 'Guest Capacity', type: 'number', required: true, group: 'Details' },
      { name: 'bedType', label: 'Bed Type', type: 'select', required: true, options: ['Single', 'Double', 'Twin', 'Queen', 'King'], group: 'Details' },
      { name: 'roomSize', label: 'Room Size (sq ft)', type: 'number', required: false, group: 'Details' },
      { name: 'floor', label: 'Floor', type: 'number', required: false, group: 'Details' },
      { name: 'view', label: 'Room View', type: 'select', required: false, options: ['City', 'Garden', 'Sea', 'Mountain', 'Pool'], group: 'Details' },
      { name: 'amenities', label: 'Amenities', type: 'array', required: false, options: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Bathtub', 'Shower', 'Safe', 'Balcony'], group: 'Amenities' },
      { name: 'isFeatured', label: 'Featured Room', type: 'checkbox', required: false }
    ]
  },

  service: {
    id: 'service',
    name: 'Service Provider',
    displayName: 'Service Provider',
    icon: 'miscellaneous_services',
    dashboardTitle: 'Service Provider Management',
    dashboardDescription: 'Manage services, appointments, staff, and client bookings.',
    productLabel: 'Service',
    color: 'from-blue-600 to-indigo-600',
    emoji: '💇',
    categories: [
      'hair-cut',
      'hair-color',
      'massage',
      'facial',
      'makeup',
      'cleaning',
      'plumbing',
      'electrical'
    ],
    productFields: [
      { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: 'e.g., Haircut & Styling' },
      { name: 'category', label: 'Service Category', type: 'select', required: true },
      { name: 'description', label: 'Service Description', type: 'textarea', required: true },
      { name: 'price', label: 'Service Price', type: 'number', required: true },
      { name: 'stock', label: 'Daily Slots Available', type: 'number', required: true },
      { name: 'images', label: 'Service Images', type: 'array', required: false },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, group: 'Details' },
      { name: 'skillLevel', label: 'Skill Level Required', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], group: 'Details' },
      { name: 'maxClients', label: 'Max Clients per Session', type: 'number', required: false, group: 'Details' },
      { name: 'onsite', label: 'Onsite Available', type: 'checkbox', required: false, group: 'Service Type' },
      { name: 'remote', label: 'Remote Available', type: 'checkbox', required: false, group: 'Service Type' }
    ]
  },

  'pet-store': {
    id: 'pet-store',
    name: 'Pet Store',
    displayName: 'Pet Store',
    icon: 'pets',
    dashboardTitle: 'Pet Store Management',
    dashboardDescription: 'Manage pet products, supplies, and pet-related services.',
    productLabel: 'Pet Product',
    color: 'from-amber-600 to-orange-600',
    emoji: '🐾',
    categories: [
      'dog-food',
      'cat-food',
      'toys',
      'accessories',
      'grooming',
      'treats',
      'pet-furniture',
      'healthcare'
    ],
    productFields: [
      { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Premium Dog Food 5kg' },
      { name: 'category', label: 'Product Category', type: 'select', required: true },
      { name: 'description', label: 'Product Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'images', label: 'Product Images', type: 'array', required: true },
      { name: 'petType', label: 'Suitable For', type: 'select', required: true, options: ['Dog', 'Cat', 'Bird', 'Rabbit', 'Fish', 'Other'], group: 'Details' },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Details' },
      { name: 'size', label: 'Product Size', type: 'text', required: false, group: 'Details' },
      { name: 'ingredients', label: 'Main Ingredients', type: 'array', required: false, group: 'Details' },
      { name: 'ageRange', label: 'Age Range (Puppy/Adult/Senior)', type: 'text', required: false, group: 'Details' },
      { name: 'isOrganic', label: 'Organic', type: 'checkbox', required: false, group: 'Details' },
      { name: 'allergenFree', label: 'Allergen-Free', type: 'checkbox', required: false, group: 'Details' }
    ]
  },

  gym: {
    id: 'gym',
    name: 'Gym/Fitness',
    displayName: 'Gym/Fitness Center',
    icon: 'fitness_center',
    dashboardTitle: 'Gym Management',
    dashboardDescription: 'Manage equipment, classes, memberships, and training programs.',
    productLabel: 'Equipment/Class',
    color: 'from-red-600 to-pink-600',
    emoji: '🏋️',
    categories: [
      'cardio',
      'free-weights',
      'machines',
      'accessories',
      'classes',
      'training-programs'
    ],
    productFields: [
      { name: 'name', label: 'Item/Class Name', type: 'text', required: true, placeholder: 'e.g., Treadmill Pro 3000' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'stock', label: 'Available Quantity', type: 'number', required: true },
      { name: 'images', label: 'Images', type: 'array', required: false },
      { name: 'equipmentType', label: 'Equipment Type', type: 'select', required: false, options: ['Cardio', 'Free Weight', 'Machine', 'Functional'], group: 'Details' },
      { name: 'weightCapacity', label: 'Weight Capacity (lbs)', type: 'number', required: false, group: 'Details' },
      { name: 'targetMuscles', label: 'Target Muscles', type: 'array', required: false, group: 'Details' },
      { name: 'material', label: 'Material', type: 'text', required: false, group: 'Details' },
      { name: 'difficulty', label: 'Difficulty Level', type: 'select', required: false, options: ['Beginner', 'Intermediate', 'Advanced'], group: 'Details' }
    ]
  },

  furniture: {
    id: 'furniture',
    name: 'Furniture',
    displayName: 'Furniture Store',
    icon: 'chair',
    dashboardTitle: 'Furniture Store Management',
    dashboardDescription: 'Manage furniture inventory, specifications, shipping, and assembly details.',
    productLabel: 'Furniture Item',
    color: 'from-amber-700 to-yellow-600',
    emoji: '🪑',
    categories: [
      'sofas',
      'chairs',
      'tables',
      'beds',
      'cabinets',
      'shelves',
      'desks',
      'outdoor-furniture',
      'lighting',
      'decor'
    ],
    productFields: [
      { name: 'name', label: 'Furniture Name', type: 'text', required: true, placeholder: 'e.g., Modern Leather Sofa' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '299.99' },
      { name: 'originalPrice', label: 'Original Price', type: 'number', required: false },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'sku', label: 'SKU', type: 'text', required: false },
      { name: 'images', label: 'Product Images', type: 'array', required: true },
      { name: 'material', label: 'Material', type: 'multiselect', required: false, group: 'Specifications', options: ['Wood', 'Metal', 'Leather', 'Fabric', 'Glass', 'Plastic', 'Composite', 'Upholstery'] },
      { name: 'finish', label: 'Finish', type: 'select', required: false, group: 'Specifications', options: ['Matte', 'Glossy', 'Satin', 'Rustic', 'Polished', 'Natural'] },
      { name: 'color', label: 'Available Colors', type: 'multiselect', required: false, group: 'Variants', options: ['Black', 'White', 'Brown', 'Gray', 'Beige', 'Cream', 'Red', 'Blue', 'Green', 'Natural Wood', 'Walnut', 'Oak'] },
      { name: 'style', label: 'Style', type: 'select', required: false, group: 'Details', options: ['Modern', 'Contemporary', 'Classic', 'Traditional', 'Rustic', 'Industrial', 'Minimalist', 'Scandinavian', 'Mid-Century'] },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Details' },
      { name: 'width', label: 'Width (inches)', type: 'number', required: false, group: 'Dimensions' },
      { name: 'height', label: 'Height (inches)', type: 'number', required: false, group: 'Dimensions' },
      { name: 'depth', label: 'Depth (inches)', type: 'number', required: false, group: 'Dimensions' },
      { name: 'weight', label: 'Weight (lbs)', type: 'number', required: false, group: 'Dimensions' },
      { name: 'warranty', label: 'Warranty Period (years)', type: 'number', required: false, group: 'Details' },
      { name: 'assembly', label: 'Assembly Required', type: 'checkbox', required: false, group: 'Shipping & Assembly' },
      { name: 'assemblyTime', label: 'Assembly Time (minutes)', type: 'number', required: false, group: 'Shipping & Assembly' },
      { name: 'shipping', label: 'Free Shipping Available', type: 'checkbox', required: false, group: 'Shipping & Assembly' },
      { name: 'isFeatured', label: 'Featured Product', type: 'checkbox', required: false }
    ]
  }
};

export function getVendorTypeConfig(vendorType: string): VendorTypeConfig | null {
  return VENDOR_TYPE_CONFIG[vendorType] || null;
}

export function getVendorDashboardTitle(vendorType: string): string {
  const config = getVendorTypeConfig(vendorType);
  return config?.dashboardTitle || 'Vendor Dashboard';
}

export function getVendorProductLabel(vendorType: string): string {
  const config = getVendorTypeConfig(vendorType);
  return config?.productLabel || 'Product';
}
