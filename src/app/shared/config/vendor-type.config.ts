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
  'clothing-store': {
    id: 'clothing-store',
    name: 'Clothing Store',
    displayName: 'Clothing Store',
    icon: 'checkroom',
    dashboardTitle: 'Clothing Store Management',
    dashboardDescription: 'Manage apparel inventory, sizes, colors, and customer orders.',
    productLabel: 'Clothing Item',
    color: 'from-blue-600 to-cyan-600',
    emoji: '👕',
    categories: [
      'adult-wear',
      'children-wear'
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

  'jewelry': {
    id: 'jewelry',
    name: 'Jewelry',
    displayName: 'Jewelry Store',
    icon: 'diamond',
    dashboardTitle: 'Jewelry Store Management',
    dashboardDescription: 'Manage jewelry inventory, materials, and precious stone specifications.',
    productLabel: 'Jewelry Item',
    color: 'from-yellow-600 to-amber-600',
    emoji: '💍',
    categories: [
      'jewelry'
    ],
    productFields: [
      { name: 'name', label: 'Jewelry Name', type: 'text', required: true, placeholder: 'e.g., Gold Diamond Ring' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: false },
      { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '299.99' },
      { name: 'originalPrice', label: 'Original Price', type: 'number', required: false },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'sku', label: 'SKU', type: 'text', required: false },
      { name: 'images', label: 'Product Images', type: 'array', required: true },
      { name: 'material', label: 'Material', type: 'multiselect', required: false, group: 'Specifications', options: ['Gold', 'Silver', 'Platinum', 'Copper', 'Titanium', 'Stainless Steel'] },
      { name: 'gemstone', label: 'Gemstone Type', type: 'text', required: false, group: 'Specifications' },
      { name: 'caratWeight', label: 'Carat Weight', type: 'number', required: false, group: 'Specifications' },
      { name: 'color', label: 'Available Colors', type: 'multiselect', required: false, group: 'Variants', options: ['Gold', 'Silver', 'Rose Gold', 'White Gold', 'Yellow Gold', 'Platinum'] },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Details' },
      { name: 'certifications', label: 'Certifications', type: 'array', required: false, group: 'Details' },
      { name: 'warranty', label: 'Warranty Period (years)', type: 'number', required: false, group: 'Details' },
      { name: 'isFeatured', label: 'Featured Product', type: 'checkbox', required: false }
    ]
  },

  'supermarket': {
    id: 'supermarket',
    name: 'Supermarket',
    displayName: 'Supermarket',
    icon: 'shopping_basket',
    dashboardTitle: 'Supermarket Management',
    dashboardDescription: 'Manage grocery items, stock levels, and bulk orders.',
    productLabel: 'Grocery Item',
    color: 'from-emerald-600 to-teal-600',
    emoji: '🛒',
    categories: [
      'supermarket',
      'groceries'
    ],
    productFields: [
      { name: 'name', label: 'Product Name', type: 'text', required: true, placeholder: 'e.g., Organic Milk 1L' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: false },
      { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '3.99' },
      { name: 'originalPrice', label: 'Original Price', type: 'number', required: false },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'sku', label: 'SKU/Barcode', type: 'text', required: false },
      { name: 'images', label: 'Product Images', type: 'array', required: false },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Details' },
      { name: 'manufacturer', label: 'Manufacturer', type: 'text', required: false, group: 'Details' },
      { name: 'expiryDate', label: 'Expiry Date', type: 'text', required: false, group: 'Details' },
      { name: 'weight', label: 'Weight/Volume', type: 'text', required: false, group: 'Details' },
      { name: 'ingredients', label: 'Ingredients', type: 'array', required: false, group: 'Details' },
      { name: 'allergens', label: 'Allergens', type: 'array', required: false, group: 'Details' },
      { name: 'isOrganic', label: 'Organic', type: 'checkbox', required: false, group: 'Details' },
      { name: 'isFeatured', label: 'Featured Product', type: 'checkbox', required: false }
    ]
  },

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

  'hair-salon': {
    id: 'hair-salon',
    name: 'Hair Salon',
    displayName: 'Hair Salon',
    icon: 'scissors',
    dashboardTitle: 'Hair Salon Management',
    dashboardDescription: 'Manage haircut services, stylists, appointments, and customer bookings.',
    productLabel: 'Hair Service',
    color: 'from-pink-600 to-rose-600',
    emoji: '💇',
    categories: [
      'hair-cut',
      'hair-color',
      'hair-treatment',
      'styling',
      'extensions',
      'perms',
      'blow-dry'
    ],
    productFields: [
      { name: 'name', label: 'Service Name', type: 'text', required: true, placeholder: 'e.g., Haircut & Styling' },
      { name: 'category', label: 'Service Category', type: 'select', required: true },
      { name: 'description', label: 'Service Description', type: 'textarea', required: true },
      { name: 'price', label: 'Service Price', type: 'number', required: true },
      { name: 'stock', label: 'Daily Slots Available', type: 'number', required: true },
      { name: 'images', label: 'Service Images', type: 'array', required: false },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, group: 'Details' },
      { name: 'serviceType', label: 'Service Type', type: 'multiselect', required: false, options: ['Men', 'Women', 'Kids', 'Unisex'], group: 'Details' },
      { name: 'skillLevel', label: 'Stylist Level Required', type: 'select', required: true, options: ['Junior', 'Senior', 'Master', 'Expert'], group: 'Details' },
      { name: 'productIncluded', label: 'Products Included', type: 'checkbox', required: false, group: 'Details' },
      { name: 'consultationIncluded', label: 'Free Consultation', type: 'checkbox', required: false, group: 'Details' }
    ]
  },

  'gym': {
    id: 'gym',
    name: 'Gym/Fitness Center',
    displayName: 'Gym/Fitness Center',
    icon: 'fitness_center',
    dashboardTitle: 'Fitness Center Management',
    dashboardDescription: 'Manage fitness classes, programs, memberships, and trainer schedules.',
    productLabel: 'Class/Program',
    color: 'from-orange-600 to-red-600',
    emoji: '🏋️',
    categories: [
      'cardio',
      'strength-training',
      'yoga',
      'pilates',
      'zumba',
      'boxing',
      'crossfit',
      'personal-training'
    ],
    productFields: [
      { name: 'name', label: 'Class/Program Name', type: 'text', required: true, placeholder: 'e.g., HIIT Training' },
      { name: 'category', label: 'Class Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price per Session', type: 'number', required: true },
      { name: 'stock', label: 'Class Capacity', type: 'number', required: true },
      { name: 'images', label: 'Class Images', type: 'array', required: false },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, group: 'Details' },
      { name: 'difficulty', label: 'Difficulty Level', type: 'select', required: true, options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'], group: 'Details' },
      { name: 'instructor', label: 'Instructor Name', type: 'text', required: false, group: 'Details' },
      { name: 'targetAudience', label: 'Target Audience', type: 'multiselect', required: false, options: ['Men', 'Women', 'Mixed', 'Kids', 'Seniors'], group: 'Details' },
      { name: 'equipment', label: 'Equipment Required', type: 'array', required: false, group: 'Details' },
      { name: 'certification', label: 'Instructor Certification', type: 'text', required: false, group: 'Details' }
    ]
  },

  'salon-spa': {
    id: 'salon-spa',
    name: 'Salon & Spa',
    displayName: 'Salon & Spa',
    icon: 'spa',
    dashboardTitle: 'Salon & Spa Management',
    dashboardDescription: 'Manage beauty, wellness services, treatments, and spa appointments.',
    productLabel: 'Treatment/Service',
    color: 'from-purple-600 to-indigo-600',
    emoji: '💅',
    categories: [
      'facial',
      'massage',
      'manicure',
      'pedicure',
      'body-treatment',
      'waxing',
      'makeup',
      'skin-care'
    ],
    productFields: [
      { name: 'name', label: 'Treatment Name', type: 'text', required: true, placeholder: 'e.g., Swedish Massage' },
      { name: 'category', label: 'Treatment Category', type: 'select', required: true },
      { name: 'description', label: 'Treatment Description', type: 'textarea', required: true },
      { name: 'price', label: 'Service Price', type: 'number', required: true },
      { name: 'stock', label: 'Daily Slots Available', type: 'number', required: true },
      { name: 'images', label: 'Treatment Images', type: 'array', required: false },
      { name: 'duration', label: 'Duration (minutes)', type: 'number', required: true, group: 'Details' },
      { name: 'treatmentType', label: 'Treatment Type', type: 'select', required: true, options: ['Relaxation', 'Therapeutic', 'Aesthetic', 'Medical'], group: 'Details' },
      { name: 'productsUsed', label: 'Products/Brands Used', type: 'array', required: false, group: 'Details' },
      { name: 'therapistLevel', label: 'Therapist Level Required', type: 'select', required: true, options: ['Junior', 'Senior', 'Master', 'Specialist'], group: 'Details' },
      { name: 'suitableFor', label: 'Suitable For', type: 'multiselect', required: false, options: ['Men', 'Women', 'Both', 'Kids', 'Pregnant'], group: 'Details' },
      { name: 'contraindications', label: 'Contraindications', type: 'array', required: false, group: 'Details' }
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

  'gym-equipment': {
    id: 'gym-equipment',
    name: 'Gym Equipment Store',
    displayName: 'Gym Equipment Store',
    icon: 'fitness_center',
    dashboardTitle: 'Gym Equipment Store Management',
    dashboardDescription: 'Manage gym equipment inventory, specifications, and fitness product sales.',
    productLabel: 'Equipment',
    color: 'from-red-600 to-pink-600',
    emoji: '🏋️',
    categories: [
      'cardio',
      'free-weights',
      'machines',
      'accessories',
      'supplements',
      'apparel'
    ],
    productFields: [
      { name: 'name', label: 'Equipment Name', type: 'text', required: true, placeholder: 'e.g., Treadmill Pro 3000' },
      { name: 'category', label: 'Category', type: 'select', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'originalPrice', label: 'Original Price', type: 'number', required: false },
      { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
      { name: 'sku', label: 'SKU', type: 'text', required: false },
      { name: 'images', label: 'Product Images', type: 'array', required: true },
      { name: 'equipmentType', label: 'Equipment Type', type: 'select', required: true, options: ['Cardio', 'Free Weight', 'Machine', 'Functional', 'Supplement', 'Apparel'], group: 'Specifications' },
      { name: 'brand', label: 'Brand', type: 'text', required: false, group: 'Specifications' },
      { name: 'weightCapacity', label: 'Weight Capacity (lbs)', type: 'number', required: false, group: 'Specifications' },
      { name: 'material', label: 'Material', type: 'multiselect', required: false, group: 'Specifications', options: ['Steel', 'Cast Iron', 'Rubber', 'Plastic', 'Aluminum', 'Wood', 'Fabric'] },
      { name: 'dimensions', label: 'Dimensions', type: 'text', required: false, group: 'Specifications' },
      { name: 'weight', label: 'Weight (lbs)', type: 'number', required: false, group: 'Specifications' },
      { name: 'color', label: 'Available Colors', type: 'multiselect', required: false, group: 'Variants', options: ['Black', 'Red', 'Blue', 'Silver', 'Gray', 'White', 'Multi-color'] },
      { name: 'warranty', label: 'Warranty Period (years)', type: 'number', required: false, group: 'Details' },
      { name: 'targetMuscles', label: 'Target Muscles', type: 'array', required: false, group: 'Details' },
      { name: 'assemblyRequired', label: 'Assembly Required', type: 'checkbox', required: false, group: 'Details' },
      { name: 'isFeatured', label: 'Featured Product', type: 'checkbox', required: false }
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
