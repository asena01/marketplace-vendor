import { Service, Category } from '../models/marketplace.model';

export const MARKETPLACE_SERVICES: Service[] = [
  {
    id: 'shopping',
    name: 'Shopping',
    description: 'Browse thousands of products from various categories',
    icon: '🛍️',
    route: '/shopping',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    categories: [
      { id: 'adult-wear', name: 'Adult Wears', description: 'Clothing for adults', icon: '👔' , color: 'text-blue-600' },
      { id: 'children-wear', name: 'Children Wears', description: 'Kids clothing', icon: '👕', color: 'text-pink-600' },
      { id: 'jewelry', name: 'Jewelry', description: 'Jewelry & accessories', icon: '💍', color: 'text-yellow-600' },
      { id: 'supermarket', name: 'Supermarkets', description: 'Groceries & essentials', icon: '🛒', color: 'text-green-600' },
    ]
  },
  {
    id: 'hotels',
    name: 'Hotels & Stays',
    description: 'Find and book accommodations for your trips',
    icon: '🏨',
    route: '/hotels',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    categories: [
      { id: 'hotels', name: 'Hotels', description: 'Premium hotels', icon: '🏨', color: 'text-emerald-600' },
      { id: 'apartments', name: 'Apartments', description: 'Serviced apartments', icon: '🏢', color: 'text-teal-600' },
      { id: 'rooms', name: 'Rooms', description: 'Private rooms', icon: '🚪', color: 'text-cyan-600' },
    ]
  },
  {
    id: 'food',
    name: 'Food Delivery',
    description: 'Order food from your favorite restaurants',
    icon: '🍕',
    route: '/food',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    categories: [
      { id: 'restaurants', name: 'Restaurants', description: 'Full-service restaurants', icon: '🍽️', color: 'text-orange-600' },
      { id: 'fast-food', name: 'Fast Food', description: 'Quick bites', icon: '🍔', color: 'text-red-600' },
      { id: 'groceries', name: 'Groceries', description: 'Food & groceries delivery', icon: '🥬', color: 'text-green-600' },
    ]
  },
  {
    id: 'services',
    name: 'Services',
    description: 'Connect with trusted service providers',
    icon: '💼',
    route: '/services',
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    categories: [
      { id: 'health-beauty', name: 'Health & Beauty', description: 'Spa, salon & wellness', icon: '💅', color: 'text-pink-600' },
      { id: 'car-rental', name: 'Car Rentals', description: 'Rent vehicles', icon: '🚗', color: 'text-blue-600' },
      { id: 'events', name: 'Event Centers', description: 'Event venues & planning', icon: '🎉', color: 'text-purple-600' },
      { id: 'marketplace', name: 'Marketplace', description: 'General marketplace', icon: '🏪', color: 'text-slate-600' },
    ]
  },
  {
    id: 'tours',
    name: 'Tours & Travel',
    description: 'Discover amazing experiences and adventures',
    icon: '✈️',
    route: '/tours',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-50',
    categories: [
      { id: 'tours', name: 'Tours', description: 'Guided tours & experiences', icon: '🗺️', color: 'text-cyan-600' },
      { id: 'boat-cruise', name: 'Boat Cruises', description: 'Sea & river cruises', icon: '⛴️', color: 'text-blue-600' },
      { id: 'activities', name: 'Activities', description: 'Adventures & activities', icon: '🎢', color: 'text-orange-600' },
    ]
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Quality furniture for every room and style',
    icon: '🛋️',
    route: '/furniture',
    color: 'from-amber-600 to-amber-700',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'hair',
    name: 'Hair & Extensions',
    description: 'Premium hair products and extensions',
    icon: '💇',
    route: '/hair',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-50'
  },
  {
    id: 'pets',
    name: 'Pets & Supplies',
    description: 'Everything for your beloved pets',
    icon: '🐾',
    route: '/pets',
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50'
  },
  {
    id: 'gym',
    name: 'Gym Equipment',
    description: 'Professional fitness equipment and accessories',
    icon: '🏋️',
    route: '/gym',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50'
  },
  {
    id: 'delivery',
    name: 'Fast Delivery',
    description: 'Quick delivery of food, groceries, and goods',
    icon: '🛵',
    route: '/delivery',
    color: 'from-teal-500 to-teal-600',
    bgColor: 'bg-teal-50',
    categories: [
      { id: 'food-delivery', name: 'Food Delivery', description: 'Order food online', icon: '🍕', color: 'text-orange-600' },
      { id: 'grocery-delivery', name: 'Grocery Delivery', description: 'Groceries & essentials', icon: '🛒', color: 'text-green-600' },
      { id: 'goods-delivery', name: 'Goods Delivery', description: 'Quick package delivery', icon: '📦', color: 'text-blue-600' },
    ]
  },
];
