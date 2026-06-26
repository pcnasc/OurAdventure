// ============================================================================
// Database Types — mirrors the foundation schema
// Generated manually from 00001_create_foundation_schema.sql
// ============================================================================

// ── Enum Types ──────────────────────────────────────────────────────────────

export type TripStatus = "draft" | "planned" | "active" | "completed" | "cancelled";

export type ChecklistItemStatus = "pending" | "in_progress" | "done" | "skipped";

export type FlightAlertStatus = "active" | "paused" | "triggered" | "expired";

export type CabinClass = "economy" | "premium_economy" | "business" | "first";

// ── Table Row Types ─────────────────────────────────────────────────────────

export interface Trip {
  id: string;
  name: string;
  description: string | null;
  notes: string | null;
  cover_image_url: string | null;
  destination: string;
  country_code: string | null;
  timezone: string;
  start_date: string;
  end_date: string;
  budget_currency: string;
  budget_total: number;
  budget_spent: number;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string;
  title: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItineraryActivity {
  id: string;
  day_id: string;
  sort_order: number;
  start_time: string | null;
  end_time: string | null;
  title: string;
  description: string | null;
  location: string | null;
  category: string | null;
  estimated_cost: number;
  actual_cost: number | null;
  currency: string;
  booking_ref: string | null;
  url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Checklist {
  id: string;
  trip_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  label: string;
  notes: string | null;
  sort_order: number;
  status: ChecklistItemStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface FlightAlert {
  id: string;
  trip_id: string;
  origin_iata: string;
  destination_iata: string;
  departure_date: string;
  return_date: string | null;
  cabin: CabinClass;
  max_stops: number | null;
  preferred_airlines: string[] | null;
  target_price: number;
  currency: string;
  status: FlightAlertStatus;
  last_checked_at: string | null;
  lowest_price_seen: number | null;
  created_at: string;
  updated_at: string;
}

export interface FlightPriceSnapshot {
  id: string;
  alert_id: string;
  price: number;
  currency: string;
  airline_iata: string | null;
  airline_name: string | null;
  stops: number;
  duration_minutes: number | null;
  departure_at: string | null;
  arrival_at: string | null;
  return_departure_at: string | null;
  return_arrival_at: string | null;
  source: string | null;
  raw_url: string | null;
  is_triggered: boolean;
  created_at: string;
}

// ── Extended Types (with joined data) ───────────────────────────────────────

export interface TripWithStats extends Trip {
  checklist_progress?: number; // 0-100
  activities_count?: number;
  days_count?: number;
}

export interface ChecklistWithItems extends Checklist {
  items: ChecklistItem[];
}

export interface ItineraryDayWithActivities extends ItineraryDay {
  activities: ItineraryActivity[];
}

export interface FlightAlertWithSnapshots extends FlightAlert {
  snapshots: FlightPriceSnapshot[];
}
