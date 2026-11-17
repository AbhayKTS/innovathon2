// Mock data for AAPDA Grid — all data is DEMO/SIMULATED
// This file is the single source of truth for frontend mock data

import type {
  Incident,
  RoadSegment,
  Settlement,
  ReliefRequest,
  ReliefItem,
  Delivery,
  DemoStats,
} from "@/types";

// ─── Incidents ────────────────────────────────────────────────────────────────
export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-001",
    title: "Landslide blocks NH-44 near Ramban",
    description:
      "Major landslide reported at NH-44, approximately 3km north of Ramban town. Multiple vehicles stranded. Debris approximately 50m wide.",
    severity: "critical",
    status: "verified",
    district: "Ramban",
    location: { lat: 33.244, lng: 75.258 },
    reportedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reportedBy: "field_officer_01",
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    evidence: [
      {
        id: "EV-001-1",
        type: "image",
        url: "/demo/landslide-01.jpg",
        caption: "View from south approach",
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        uploadedBy: "field_officer_01",
        aiAnalyzed: true,
        aiCaption: "Large debris field, estimated 200+ cubic meters. Road fully blocked.",
      },
    ],
    aiScore: {
      confidence: 0.91,
      duplicateProbability: 0.04,
      consistencyScore: 0.95,
      uncertaintyFlags: [],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["landslide", "road-block", "NH-44"],
    isDemo: true,
  },
  {
    id: "INC-002",
    title: "Flash flood in Chenab basin — Doda sector",
    description:
      "Residents report rapid rise in Chenab river levels near Doda. Several low-lying areas inundated. Evacuation in progress.",
    severity: "high",
    status: "under_review",
    district: "Doda",
    location: { lat: 33.148, lng: 75.546 },
    reportedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reportedBy: "citizen_app",
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    evidence: [],
    aiScore: {
      confidence: 0.74,
      duplicateProbability: 0.12,
      consistencyScore: 0.78,
      uncertaintyFlags: ["No photographic evidence", "Single source report"],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["flood", "chenab", "evacuation"],
    isDemo: true,
  },
  {
    id: "INC-003",
    title: "Road collapse on Mughal Road near Shopian",
    description:
      "Heavy rainfall caused road surface collapse on Mughal Road. 15m section missing. No injuries reported.",
    severity: "high",
    status: "verified",
    district: "Shopian",
    location: { lat: 33.713, lng: 74.84 },
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    reportedBy: "field_officer_02",
    updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    evidence: [
      {
        id: "EV-003-1",
        type: "image",
        url: "/demo/road-collapse-01.jpg",
        caption: "Road damage from north",
        uploadedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        uploadedBy: "field_officer_02",
        aiAnalyzed: true,
        aiCaption: "Subsidence clearly visible. Approximately 15m affected.",
      },
    ],
    aiScore: {
      confidence: 0.88,
      duplicateProbability: 0.02,
      consistencyScore: 0.9,
      uncertaintyFlags: [],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["road-collapse", "mughal-road"],
    isDemo: true,
  },
  {
    id: "INC-004",
    title: "Building collapse reported in Kishtwar town",
    description:
      "Partial collapse of a 2-storey residential structure in Kishtwar old town. 3 families evacuated. Search ongoing.",
    severity: "critical",
    status: "reported",
    district: "Kishtwar",
    location: { lat: 33.313, lng: 75.771 },
    reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reportedBy: "citizen_app",
    updatedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    evidence: [],
    aiScore: {
      confidence: 0.55,
      duplicateProbability: 0.28,
      consistencyScore: 0.6,
      uncertaintyFlags: [
        "No coordinates provided",
        "Possible duplicate of INC-003",
        "Unverified source",
      ],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["building-collapse", "kishtwar"],
    isDemo: true,
  },
  {
    id: "INC-005",
    title: "Minor rockfall on Banihal-Ramban highway",
    description:
      "Small rockfall reported. Single lane passable. PWD notified.",
    severity: "medium",
    status: "verified",
    district: "Ramban",
    location: { lat: 33.5, lng: 75.21 },
    reportedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reportedBy: "field_officer_01",
    updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    evidence: [],
    aiScore: {
      confidence: 0.82,
      duplicateProbability: 0.08,
      consistencyScore: 0.85,
      uncertaintyFlags: [],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["rockfall", "banihal"],
    isDemo: true,
  },
  {
    id: "INC-006",
    title: "Bridge damage near Bhaderwah",
    description:
      "Flood waters damaged one span of a single-lane bridge near Bhaderwah. Currently closed to heavy vehicles.",
    severity: "high",
    status: "under_review",
    district: "Doda",
    location: { lat: 32.978, lng: 75.726 },
    reportedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    reportedBy: "field_officer_03",
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    evidence: [],
    aiScore: {
      confidence: 0.71,
      duplicateProbability: 0.05,
      consistencyScore: 0.73,
      uncertaintyFlags: ["Single source"],
      label: "AI Recommendation (unverified — human review required)",
    },
    tags: ["bridge", "bhaderwah", "flood"],
    isDemo: true,
  },
];

// ─── Road Segments ────────────────────────────────────────────────────────────
export const MOCK_ROADS: RoadSegment[] = [
  {
    id: "RD-001",
    name: "NH-44 Ramban Sector",
    district: "Ramban",
    status: "closed",
    closureReason: "Landslide debris",
    affectedFrom: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedClearance: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    coordinates: [
      { lat: 33.22, lng: 75.24 },
      { lat: 33.26, lng: 75.27 },
    ],
    affectedSettlements: ["SET-001", "SET-002"],
    alternateRouteAvailable: true,
    isDemo: true,
  },
  {
    id: "RD-002",
    name: "Mughal Road Shopian",
    district: "Shopian",
    status: "closed",
    closureReason: "Road surface collapse",
    affectedFrom: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    estimatedClearance: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    coordinates: [
      { lat: 33.70, lng: 74.82 },
      { lat: 33.73, lng: 74.86 },
    ],
    affectedSettlements: ["SET-003"],
    alternateRouteAvailable: false,
    isDemo: true,
  },
  {
    id: "RD-003",
    name: "Banihal-Ramban Highway",
    district: "Ramban",
    status: "partially_open",
    closureReason: "Rockfall — single lane only",
    affectedFrom: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    coordinates: [
      { lat: 33.48, lng: 75.19 },
      { lat: 33.52, lng: 75.23 },
    ],
    affectedSettlements: [],
    alternateRouteAvailable: true,
    isDemo: true,
  },
  {
    id: "RD-004",
    name: "Bhaderwah Bridge Road",
    district: "Doda",
    status: "partially_open",
    closureReason: "Bridge damaged — no heavy vehicles",
    affectedFrom: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    coordinates: [
      { lat: 32.97, lng: 75.72 },
      { lat: 32.99, lng: 75.73 },
    ],
    affectedSettlements: ["SET-004", "SET-005"],
    alternateRouteAvailable: false,
    isDemo: true,
  },
];

// ─── Settlements ──────────────────────────────────────────────────────────────
export const MOCK_SETTLEMENTS: Settlement[] = [
  {
    id: "SET-001",
    name: "Khari Village",
    district: "Ramban",
    population: 420,
    location: { lat: 33.27, lng: 75.29 },
    isIsolated: true,
    isolatedSince: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    accessRoads: ["RD-001"],
    nearestFacility: { name: "Ramban District Hospital", type: "hospital", distanceKm: 8.2 },
    isDemo: true,
  },
  {
    id: "SET-002",
    name: "Batote Town",
    district: "Ramban",
    population: 2100,
    location: { lat: 33.21, lng: 75.26 },
    isIsolated: false,
    accessRoads: ["RD-001", "RD-003"],
    nearestFacility: { name: "PHC Batote", type: "hospital", distanceKm: 1.5 },
    isDemo: true,
  },
  {
    id: "SET-003",
    name: "Hirpura",
    district: "Shopian",
    population: 180,
    location: { lat: 33.74, lng: 74.88 },
    isIsolated: true,
    isolatedSince: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    accessRoads: ["RD-002"],
    nearestFacility: { name: "Shopian District Hospital", type: "hospital", distanceKm: 15.3 },
    isDemo: true,
  },
  {
    id: "SET-004",
    name: "Palmarpur",
    district: "Doda",
    population: 350,
    location: { lat: 32.98, lng: 75.74 },
    isIsolated: true,
    isolatedSince: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    accessRoads: ["RD-004"],
    isDemo: true,
  },
  {
    id: "SET-005",
    name: "Gandoh",
    district: "Doda",
    population: 920,
    location: { lat: 33.0, lng: 75.76 },
    isIsolated: false,
    accessRoads: ["RD-004"],
    nearestFacility: { name: "CHC Gandoh", type: "hospital", distanceKm: 2.1 },
    isDemo: true,
  },
];

// ─── Relief ───────────────────────────────────────────────────────────────────
export const MOCK_RELIEF_ITEMS: ReliefItem[] = [
  { id: "RI-001", name: "Food Packets (family kit)", category: "food", unit: "kit", quantityAvailable: 1200, quantityReserved: 340, warehouseId: "WH-01" },
  { id: "RI-002", name: "Drinking Water (20L)", category: "water", unit: "can", quantityAvailable: 800, quantityReserved: 150, warehouseId: "WH-01" },
  { id: "RI-003", name: "Emergency Shelter Kit", category: "shelter", unit: "kit", quantityAvailable: 200, quantityReserved: 45, warehouseId: "WH-02" },
  { id: "RI-004", name: "First Aid Kit", category: "medicine", unit: "kit", quantityAvailable: 350, quantityReserved: 80, warehouseId: "WH-01" },
  { id: "RI-005", name: "Blankets", category: "clothing", unit: "piece", quantityAvailable: 1500, quantityReserved: 200, warehouseId: "WH-02" },
];

export const MOCK_RELIEF_REQUESTS: ReliefRequest[] = [
  {
    id: "RR-001",
    settlementId: "SET-001",
    settlementName: "Khari Village",
    district: "Ramban",
    requestedBy: "field_officer_01",
    status: "pending",
    items: [
      { itemId: "RI-001", name: "Food Packets", quantityRequested: 100 },
      { itemId: "RI-002", name: "Drinking Water (20L)", quantityRequested: 50 },
      { itemId: "RI-004", name: "First Aid Kit", quantityRequested: 10 },
    ],
    priority: "critical",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    aiAllocationSuggestion: {
      label: "AI Recommendation (unverified — human review required)",
      suggestedItems: [
        { itemId: "RI-001", quantity: 100, rationale: "Population 420, 3-day supply at 1 kit/4 persons/day" },
        { itemId: "RI-002", quantity: 50, rationale: "2L/person/day for 420 persons, 2-day supply" },
        { itemId: "RI-004", quantity: 10, rationale: "Standard ratio for 420 persons" },
      ],
      feasibilityScore: 0.72,
    },
    isDemo: true,
  },
  {
    id: "RR-002",
    settlementId: "SET-003",
    settlementName: "Hirpura",
    district: "Shopian",
    requestedBy: "ngo_partner_01",
    status: "pending",
    items: [
      { itemId: "RI-001", name: "Food Packets", quantityRequested: 45 },
      { itemId: "RI-003", name: "Emergency Shelter Kit", quantityRequested: 12 },
    ],
    priority: "high",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
  {
    id: "RR-003",
    settlementId: "SET-004",
    settlementName: "Palmarpur",
    district: "Doda",
    requestedBy: "ddma_officer_01",
    status: "approved",
    items: [
      { itemId: "RI-001", name: "Food Packets", quantityRequested: 90, quantityApproved: 90 },
      { itemId: "RI-005", name: "Blankets", quantityRequested: 70, quantityApproved: 70 },
    ],
    priority: "high",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isDemo: true,
  },
];

export const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "DEL-001",
    requestId: "RR-003",
    settlementId: "SET-004",
    settlementName: "Palmarpur",
    district: "Doda",
    status: "in_transit",
    scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    vehicleId: "VH-07",
    driverName: "Mohammad Yusuf",
    items: [
      { name: "Food Packets", quantity: 90 },
      { name: "Blankets", quantity: 70 },
    ],
    isDemo: true,
  },
];

// ─── Computed Stats ───────────────────────────────────────────────────────────
export function computeDemoStats(): DemoStats {
  const incidentsByStatus = MOCK_INCIDENTS.reduce(
    (acc, inc) => {
      acc[inc.status] = (acc[inc.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  ) as DemoStats["incidentsByStatus"];

  return {
    totalIncidents: MOCK_INCIDENTS.length,
    incidentsByStatus,
    roadsClosed: MOCK_ROADS.filter((r) => r.status === "closed").length,
    roadsPartiallyOpen: MOCK_ROADS.filter((r) => r.status === "partially_open").length,
    isolatedSettlements: MOCK_SETTLEMENTS.filter((s) => s.isIsolated).length,
    pendingReliefRequests: MOCK_RELIEF_REQUESTS.filter((r) => r.status === "pending").length,
    criticalIncidents: MOCK_INCIDENTS.filter((i) => i.severity === "critical").length,
  };
}
