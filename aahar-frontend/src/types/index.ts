// ─────────────────────────────────────────────────────────
//  AAHAR — Shared TypeScript Types
//  Used across all frontend components and API calls
// ─────────────────────────────────────────────────────────

// ── User & Auth ───────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "admin"
  | "auditor"
  | "owner"
  | "hotel_manager"
  | "consumer";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ── Certification ─────────────────────────────────────────
export type CertStatus = "active" | "expiring" | "expired" | "suspended" | "revoked";
export type CertType   = "fnb" | "accommodation";

export interface Certification {
  id: string;
  certNumber: string;        // e.g. AHR-FB-2024-04821
  type: CertType;
  entityId: string;
  entityType: "restaurant" | "hotel";
  issuedAt: string;
  expiresAt: string;
  status: CertStatus;
  qrCodeUrl: string;
  pdfUrl: string;
  hygieneScore?: number;
}

export interface StandardCriterion {
  id: string;
  section: string;
  criterion: string;
  weight: number;
}

export type StandardDivision = "fnb" | "accommodation";

export interface Standard {
  id: string;
  name: string;
  version?: string;
  division: StandardDivision;
  status: "active" | "draft" | "archived";
  criteria?: StandardCriterion[];
}

// ── Restaurant ────────────────────────────────────────────
export type RestaurantCategory = string;

export type DietaryType = string;
export type PriceRange  = "₹" | "₹₹" | "₹₹₹" | "₹₹₹₹";

export interface HygieneScore {
  kitchen:       number; // 0–5
  foodStorage:   number;
  staffStandards: number;
  documentation: number;
  wasteManagement: number;
  overall:       number;
}

export interface RestaurantAmenities {
  ac:           boolean;
  wifi:         boolean;
  parking:      boolean;
  liveMusic:    boolean;
  outdoorSeating: boolean;
  delivery:     boolean;
  takeaway:     boolean;
  dineIn:       boolean;
  familyFriendly: boolean;
  accessible:   boolean;
  washroom:     boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  dietary: DietaryType;
  isAvailable: boolean;
  image?: string;
}

export interface MenuSection {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  description: string;
  category: RestaurantCategory;
  cuisineType: string[];
  dietary: DietaryType;
  priceRange: PriceRange;
  address: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  email?: string;
  website?: string;
  openingHours: OpeningHours;
  amenities: RestaurantAmenities;
  photos: PhotoGallery;
  menu: MenuSection[];
  googleRating?: number;
  googleReviewCount?: number;
  hygieneScore?: HygieneScore;
  certification?: Certification;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  createdAt: string;
}

// ── Hotel / Resort ────────────────────────────────────────
export type PropertyType = string;

export type MealPlan = string; // Room only / Breakfast / Half board / Full board

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  bedConfig: string;        // e.g. "1 King bed" | "2 Twin beds"
  maxOccupancy: number;
  priceNote: string;        // e.g. "₹4,500 / night"
  priceFrom: number;
  view?: string;
  photos: string[];
  isPopular: boolean;
  isAvailable: boolean;
}

export interface HotelAmenities {
  pool:         boolean;
  spa:          boolean;
  gym:          boolean;
  beach:        boolean;
  kidsClub:     boolean;
  conference:   boolean;
  restaurant:   boolean;
  airportTransfer: boolean;
  parking:      boolean;
  evCharging:   boolean;
  wifi:         boolean;
  petFriendly:  boolean;
  accessible:   boolean;
  smokingArea:  boolean;
}

export interface AccommodationScore {
  housekeeping:    number;
  roomSafety:      number;
  guestFacilities: number;
  fnb:             number;
  staffStandards:  number;
  overall:         number;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  managerId: string;
  description: string;
  propertyType: PropertyType;
  starRating: 1 | 2 | 3 | 4 | 5;
  address: string;
  city: string;
  area: string;
  lat: number;
  lng: number;
  phone: string;
  email?: string;
  website?: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  mealPlans: MealPlan[];
  amenities: HotelAmenities;
  roomTypes: RoomType[];
  photos: PhotoGallery;
  linkedRestaurantId?: string;      // In-house F&B
  googleRating?: number;
  accommodationScore?: AccommodationScore;
  certification?: Certification;
  isVerified: boolean;
  isActive: boolean;
  isFeatured: boolean;
  isSponsored: boolean;
  createdAt: string;
}

// ── Enquiry ───────────────────────────────────────────────
export type EnquiryStatus =
  | "sent" | "viewed" | "quoted" | "confirmed" | "declined" | "expired";

export interface EnquiryGuests {
  adults: number;
  children: number;
}

export interface Enquiry {
  id: string;
  hotelId: string;
  hotel?: Pick<Hotel, "id" | "name" | "slug" | "city">;
  guestId: string;
  guest?: Pick<User, "id" | "name" | "email" | "phone">;
  roomTypeId?: string;
  roomType?: Pick<RoomType, "id" | "name">;
  checkIn: string;
  checkOut: string;
  guests: EnquiryGuests;
  mealPlan?: MealPlan;
  specialRequirements?: string;
  status: EnquiryStatus;
  avgResponseTime?: string;
  bookingLink?: string;
  quoteAmount?: number;
  messages: EnquiryMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  senderId: string;
  senderRole: UserRole;
  content: string;
  sentAt: string;
}

// ── Application & Audit ───────────────────────────────────
export type ApplicationStatus =
  | "draft" | "submitted" | "under_review" | "gap_analysis"
  | "audit_scheduled" | "audit_complete" | "approved" | "rejected" | "certified";

export type AuditTrack = "fnb" | "accommodation";

export interface ApplicationDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  expiresAt?: string;
  status: "pending" | "approved" | "rejected" | "expired";
}

export interface Application {
  id: string;
  businessType: AuditTrack;
  entityId: string;
  entityName: string;
  applicantId: string;
  status: ApplicationStatus;
  documents: ApplicationDocument[];
  correctiveActions?: Array<{
    id: number;
    priority: "high" | "medium" | "low";
    text: string;
    dueDate: string;
    resolved: boolean;
  }>;
  timeline?: Array<{
    date: string;
    event: string;
    icon: string;
    done: boolean;
  }>;
  selfAssessmentScore?: number;
  auditId?: string;
  certificationId?: string;
  notes?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface AuditChecklistItem {
  id: string;
  section: string;
  criterion: string;
  weight: number;        // 1–5
  score?: number;        // 0–5 assigned by auditor
  notes?: string;
  photos?: string[];
}

export interface Audit {
  id: string;
  applicationId: string;
  auditorId: string;
  auditor?: Pick<User, "id" | "name" | "email">;
  track: AuditTrack;
  scheduledAt: string;
  completedAt?: string;
  checklist: AuditChecklistItem[];
  totalScore?: number;
  recommendation?: "approve" | "reject" | "re_audit";
  auditorNotes?: string;
  sitePhotos?: string[];
  status: "scheduled" | "in_progress" | "submitted" | "reviewed";
}

// ── Search ────────────────────────────────────────────────
export type SearchMode = "eat" | "stay" | "both";

export interface SearchFilters {
  mode: SearchMode;
  query?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;          // km

  // F&B filters
  cuisine?: string[];
  category?: RestaurantCategory[];
  dietary?: DietaryType;
  priceRange?: PriceRange[];
  hygieneMin?: number;

  // Stay filters
  propertyType?: PropertyType[];
  starMin?: number;
  budgetMin?: number;
  budgetMax?: number;
  amenities?: (keyof HotelAmenities)[];
  mealPlan?: MealPlan;

  // Shared
  certifiedOnly: boolean;
  openNow?: boolean;
  parking?: boolean;
  accessible?: boolean;
  familyFriendly?: boolean;
  petFriendly?: boolean;
}

export interface SearchResult {
  restaurants: Restaurant[];
  hotels: Hotel[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Shared Helpers ────────────────────────────────────────
export interface OpeningHours {
  monday:    string | null;
  tuesday:   string | null;
  wednesday: string | null;
  thursday:  string | null;
  friday:    string | null;
  saturday:  string | null;
  sunday:    string | null;
}

export interface PhotoGallery {
  cover?: string;
  kitchen?:   string[];
  interior?:  string[];
  exterior?:  string[];
  dining?:    string[];
  counter?:   string[];
  restroom?:  string[];
  food?:      string[];
  // Hotel-specific
  rooms?:    string[];
  pool?:     string[];
  lobby?:    string[];
  restaurant?: string[];
  spa?:      string[];
  gardens?:  string[];
  beach?:    string[];
  events?:   string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Notification ──────────────────────────────────────────
export type NotificationType =
  | "application_update" | "audit_scheduled" | "cert_issued"
  | "cert_expiring" | "new_enquiry" | "enquiry_response"
  | "document_expiry" | "compliance_alert";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ── Partner ───────────────────────────────────────────────
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  isFeatured: boolean;
  order: number;
  createdAt: string;
}

// ── Blog ──────────────────────────────────────────────────
export type BlogCategory = "food_safety" | "hospitality" | "hygiene" | "travel" | "announcements";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    role?: string;
  };
  category: BlogCategory;
  tags: string[];
  coverImage: string;
  readingTime: string;
  publishedAt: string;
  isFeatured: boolean;
}

// ── Table Ordering & Dine-in ──────────────────────────────
export type OrderStatus = "pending" | "preparing" | "served" | "completed" | "cancelled";

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  price: number;
  notes?: string | null;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurant?: {
    name: string;
    slug: string;
    phone?: string;
  };
  tableNumber: string;
  status: OrderStatus;
  totalAmount: number;
  customerName?: string | null;
  customerPhone?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export interface RestaurantTable {
  id: string;
  restaurantId: string;
  tableNumber: string;
  seatingCapacity: number;
  qrCodeUrl?: string | null;
  status: "active" | "occupied" | "reserved";
  createdAt: string;
  updatedAt: string;
}

