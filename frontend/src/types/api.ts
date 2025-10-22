export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Venue {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
  spaces: Space[];
}

export interface Space {
  id: number;
  venue_id: number;
  name: string;
  slug: string;
  capacity: number;
  amenities: string[];
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'completed';

export interface Reservation {
  id: number;
  space_id: number;
  booked_by_id?: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}
