export interface User {
  id: string;
  role: 'shipper' | 'driver' | 'admin';
  phoneNumber: string;
  city: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  rating: number;
  totalTransactions: number;
  bio?: string;
  verified: boolean;
}

export interface Truck {
  id: string;
  ownerId: string;
  plateNumber: string;
  truckType: 'flatbed' | 'refrigerated' | 'container' | 'tanker' | 'pickup';
  capacityKg: number;
  capacityM3?: number;
  yearManufactured: number;
  documentsVerified: boolean;
  insuranceExpiry?: string;
  locationLat?: number;
  locationLng?: number;
  currentCity: string;
  active: boolean;
}

export interface ShipmentRequest {
  id: string;
  shipperId: string;
  pickupLocation: string;
  deliveryLocation: string;
  goodsDescription: string;
  weightKg: number;
  volumeM3?: number;
  requiredTruckType?: string;
  budgetAmount: number;
  pickupDate: string;
  deliveryDate: string;
  status: 'open' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  specialRequirements?: string;
}

export interface ShipmentBid {
  id: string;
  shipmentId: string;
  truckOwnerId: string;
  truckId: string;
  bidAmount: number;
  status: 'pending' | 'accepted' | 'rejected';
  notes?: string;
}
