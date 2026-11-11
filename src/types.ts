export interface BusArrivalInfo {
  time?: string;
  minutes: number;
  label: string;
  load: 'SEA' | 'SDA' | 'LSD' | string;
  feature?: string;
  type?: 'SD' | 'DD' | 'BD' | string;
}

export interface BusService {
  serviceNo: string;
  operator: string;
  corridor: string;
  origin: string;
  dest: string;
  parkAndRideHubs: string[];
  next: BusArrivalInfo | null;
  next2: BusArrivalInfo | null;
  next3: BusArrivalInfo | null;
}

export interface BusBoardResponse {
  stopCode: string;
  stopName: string;
  roadName: string;
  updatedAt: string;
  servicesCount: number;
  services: BusService[];
  isLive: boolean;
  notice?: string;
}

export interface CarparkItem {
  id: string;
  name: string;
  area: string;
  category: 'campus' | 'outlying';
  lat?: number;
  lng?: number;
  walkingMin?: number;
  hourlyRate: number;
  totalLots: number;
  availableLots: number;
  occupancyRate: number;
  status: 'ample' | 'moderate' | 'scarce' | 'critical';
  isLiveFeed: boolean;
  notes: string;
  hdbCode?: string;
  erpGantryZone?: string;
  // Outlying specific
  corridor?: string;
  directBus?: string;
  busTravelTimeMin?: number;
  distanceKm?: number;
  erpSaved?: number;
}

export interface ErpStatus {
  gantry: string;
  rate: number;
  isPeak: boolean;
}

export interface CarparksResponse {
  updatedAt: string;
  erpInfo: ErpStatus;
  campusCarparks: CarparkItem[];
  parkAndRideHubs: CarparkItem[];
  summary: {
    campusTotalAvailable: number;
    campusTotalCapacity: number;
    campusAverageOccupancy: number;
    campusStressLevel: 'LOW' | 'MODERATE' | 'HIGH';
  };
}

export interface CommuteVerdictResponse {
  verdict: 'DRIVE_DIRECT' | 'PARK_AND_RIDE' | 'BORDERLINE';
  title: string;
  explanation: string;
  timeDifferenceText: string;
  estimatedSavings: string;
  erpStatus: ErpStatus;
  bestCampusOption: CarparkItem;
  bestParkAndRideOption: CarparkItem;
  campusTotalLots: number;
  timestamp: string;
}
