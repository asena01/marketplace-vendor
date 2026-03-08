/**
 * Delivery Service Definitions
 * Defines different delivery services that can be used across different dashboards
 * Examples: Food, Clothing, Furniture, Luggage, etc.
 */

export interface DeliveryServiceDefinition {
  id: string;
  name: string; // e.g., "Food Delivery", "Package Delivery"
  category: 'food' | 'package' | 'furniture' | 'luggage' | 'perishable' | 'bulk' | 'other';
  description: string;
  
  // Pricing configuration
  pricing: {
    basePrice: number; // Base delivery fee
    perKmRate: number; // Price per kilometer
    perKgRate: number; // Price per kilogram
    sizeMultiplier: number; // Multiplier for package size
    rushDeliveryFee?: number; // Additional fee for rush delivery
  };
  
  // Vehicle requirements
  availableVehicles: VehicleType[];
  minWeight?: number; // Minimum weight for this service
  maxWeight?: number; // Maximum weight for this service
  
  // Time estimates
  estimatedDeliveryTime: {
    standard: number; // in minutes
    rush?: number; // in minutes
    scheduled?: number; // in minutes
  };
  
  // Business types this service supports
  supportedBusinessTypes: ('restaurant' | 'retail' | 'hotel' | 'service' | 'tours' | 'warehouse')[];
  
  // Special handling
  requiresTemperatureControl?: boolean; // For food, medicine, etc.
  requiresSignature?: boolean;
  insuranceAvailable?: boolean;
  
  // Service status
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type VehicleType = 'bike' | 'scooter' | 'car' | 'van' | 'truck';

/**
 * Pre-defined delivery services for common business types
 */
export const PREDEFINED_DELIVERY_SERVICES: Record<string, DeliveryServiceDefinition> = {
  FOOD_DELIVERY: {
    id: 'food-delivery-standard',
    name: 'Food Delivery',
    category: 'food',
    description: 'Fast delivery for food orders with temperature control',
    pricing: {
      basePrice: 3.99,
      perKmRate: 0.50,
      perKgRate: 0.15,
      sizeMultiplier: 1.0,
      rushDeliveryFee: 2.99
    },
    availableVehicles: ['bike', 'scooter', 'car'],
    minWeight: 0.1,
    maxWeight: 15,
    estimatedDeliveryTime: {
      standard: 30,
      rush: 15,
      scheduled: 45
    },
    supportedBusinessTypes: ['restaurant'],
    requiresTemperatureControl: true,
    requiresSignature: false,
    insuranceAvailable: true,
    isActive: true
  },

  PACKAGE_DELIVERY: {
    id: 'package-delivery-standard',
    name: 'Package Delivery',
    category: 'package',
    description: 'Standard delivery for retail packages (clothes, electronics, etc.)',
    pricing: {
      basePrice: 2.99,
      perKmRate: 0.40,
      perKgRate: 0.10,
      sizeMultiplier: 1.2,
      rushDeliveryFee: 3.99
    },
    availableVehicles: ['bike', 'car', 'van'],
    minWeight: 0.1,
    maxWeight: 30,
    estimatedDeliveryTime: {
      standard: 45,
      rush: 20,
      scheduled: 60
    },
    supportedBusinessTypes: ['retail'],
    requiresTemperatureControl: false,
    requiresSignature: true,
    insuranceAvailable: true,
    isActive: true
  },

  FURNITURE_DELIVERY: {
    id: 'furniture-delivery-standard',
    name: 'Furniture Delivery',
    category: 'furniture',
    description: 'Large item delivery with assembly options',
    pricing: {
      basePrice: 19.99,
      perKmRate: 1.00,
      perKgRate: 0.20,
      sizeMultiplier: 2.5,
      rushDeliveryFee: 9.99
    },
    availableVehicles: ['van', 'truck'],
    minWeight: 10,
    maxWeight: 500,
    estimatedDeliveryTime: {
      standard: 240, // 4 hours
      rush: 120, // 2 hours
      scheduled: 360 // 6 hours
    },
    supportedBusinessTypes: ['retail'],
    requiresTemperatureControl: false,
    requiresSignature: true,
    insuranceAvailable: true,
    isActive: true
  },

  LUGGAGE_DELIVERY: {
    id: 'luggage-delivery-standard',
    name: 'Luggage Delivery',
    category: 'luggage',
    description: 'Travel luggage and baggage delivery for hotels and tours',
    pricing: {
      basePrice: 4.99,
      perKmRate: 0.60,
      perKgRate: 0.25,
      sizeMultiplier: 1.3,
      rushDeliveryFee: 1.99
    },
    availableVehicles: ['car', 'van'],
    minWeight: 1,
    maxWeight: 50,
    estimatedDeliveryTime: {
      standard: 60,
      rush: 30,
      scheduled: 120
    },
    supportedBusinessTypes: ['hotel', 'tours'],
    requiresTemperatureControl: false,
    requiresSignature: false,
    insuranceAvailable: true,
    isActive: true
  },

  PERISHABLE_DELIVERY: {
    id: 'perishable-delivery-premium',
    name: 'Perishable Goods Delivery',
    category: 'perishable',
    description: 'Temperature-controlled delivery for fresh food, medicine, etc.',
    pricing: {
      basePrice: 5.99,
      perKmRate: 0.75,
      perKgRate: 0.30,
      sizeMultiplier: 1.5,
      rushDeliveryFee: 3.99
    },
    availableVehicles: ['car', 'van'],
    minWeight: 0.1,
    maxWeight: 25,
    estimatedDeliveryTime: {
      standard: 25,
      rush: 15,
      scheduled: 40
    },
    supportedBusinessTypes: ['restaurant', 'service'],
    requiresTemperatureControl: true,
    requiresSignature: true,
    insuranceAvailable: true,
    isActive: true
  },

  BULK_DELIVERY: {
    id: 'bulk-delivery-warehouse',
    name: 'Bulk/Wholesale Delivery',
    category: 'bulk',
    description: 'Large quantity delivery for warehouses and wholesale',
    pricing: {
      basePrice: 29.99,
      perKmRate: 1.50,
      perKgRate: 0.05,
      sizeMultiplier: 3.0
    },
    availableVehicles: ['truck'],
    minWeight: 100,
    maxWeight: 2000,
    estimatedDeliveryTime: {
      standard: 180, // 3 hours
      scheduled: 360 // 6 hours
    },
    supportedBusinessTypes: ['warehouse', 'retail'],
    requiresTemperatureControl: false,
    requiresSignature: true,
    insuranceAvailable: true,
    isActive: true
  }
};

/**
 * Get delivery services for a specific business type
 * @param businessType The type of business (restaurant, retail, hotel, etc.)
 * @returns Array of available delivery services for this business type
 */
export function getDeliveryServicesForBusinessType(
  businessType: 'restaurant' | 'retail' | 'hotel' | 'service' | 'tours' | 'warehouse'
): DeliveryServiceDefinition[] {
  return Object.values(PREDEFINED_DELIVERY_SERVICES).filter(service => 
    service.supportedBusinessTypes.includes(businessType) && service.isActive
  );
}

/**
 * Get a specific delivery service by ID
 * @param serviceId The ID of the delivery service
 * @returns The delivery service definition or undefined
 */
export function getDeliveryServiceById(serviceId: string): DeliveryServiceDefinition | undefined {
  const service = Object.values(PREDEFINED_DELIVERY_SERVICES).find(s => s.id === serviceId);
  return service;
}

/**
 * Calculate delivery price for a specific service
 * @param service The delivery service definition
 * @param distance Distance in kilometers
 * @param weight Weight in kilograms
 * @returns Calculated price
 */
export function calculateDeliveryPrice(
  service: DeliveryServiceDefinition,
  distance: number,
  weight: number
): number {
  const { basePrice, perKmRate, perKgRate, sizeMultiplier } = service.pricing;
  
  let total = basePrice;
  total += distance * perKmRate;
  total += weight * perKgRate;
  total *= sizeMultiplier;
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

/**
 * Format delivery service for UI display
 * @param service The delivery service definition
 * @returns Formatted service object for display
 */
export function formatDeliveryService(service: DeliveryServiceDefinition) {
  return {
    id: service.id,
    name: service.name,
    category: service.category,
    description: service.description,
    basePrice: `$${service.pricing.basePrice.toFixed(2)}`,
    estimatedTime: `${service.estimatedDeliveryTime.standard} mins`,
    vehicles: service.availableVehicles.join(', '),
    maxWeight: `${service.maxWeight}kg`,
    features: [
      service.requiresTemperatureControl && 'Temperature Control',
      service.requiresSignature && 'Signature Required',
      service.insuranceAvailable && 'Insurance Available'
    ].filter(Boolean)
  };
}
