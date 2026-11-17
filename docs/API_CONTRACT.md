# API Contract — AAPDA Grid

> **Version:** 1.0.0  
> **Base URL:** `$NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`)  
> **Auth:** All endpoints except `/api/auth/*` and `/api/public/*` require `Authorization: Bearer <token>` header.  
> **Content-Type:** `application/json`

---

## Enums

| Enum | Values |
|------|--------|
| `IncidentStatus` | `reported` \| `under_review` \| `verified` \| `rejected` \| `merged` |
| `IncidentSeverity` | `low` \| `medium` \| `high` \| `critical` |
| `IncidentType` | `road_block` \| `flood` \| `landslide` \| `avalanche` \| `bridge_damage` \| `other` |
| `IncidentSource` | `citizen_app` \| `field_officer` \| `social_media` \| `ngo` \| `ddma` |
| `RoadStatus` | `open` \| `partial` \| `closed` \| `unknown` |
| `StrategicImportance` | `critical` \| `high` \| `medium` \| `low` |
| `RoadClosureSeverity` | `minor` \| `major` \| `complete` |
| `ReliefPriority` | `low` \| `medium` \| `high` \| `critical` |
| `ReliefStatus` | `pending` \| `approved` \| `allocated` \| `delivered` \| `cancelled` |
| `AllocationStatus` | `proposed` \| `approved` \| `rejected` |
| `DeliveryStatus` | `pending` \| `in_transit` \| `delivered` \| `failed` |
| `UserRole` | `citizen` \| `field_officer` \| `ddma_officer` \| `ngo_partner` \| `admin` |
| `FacilityType` | `hospital` \| `shelter` \| `warehouse` |
| `InventoryCategory` | `food` \| `water` \| `medicine` \| `shelter` \| `equipment` |

---

## Common Schemas

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "UserRole",
  "district": "string",
  "phone": "string | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Incident
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "type": "IncidentType",
  "status": "IncidentStatus",
  "severity": "IncidentSeverity",
  "lat": "number",
  "lng": "number",
  "district": "string",
  "source": "IncidentSource",
  "reporter_id": "uuid",
  "evidence": [
    { "type": "image|video|text", "url": "string", "caption": "string" }
  ],
  "ai_duplicate_score": "number (0-1)",
  "ai_location_confidence": "number (0-1)",
  "ai_timestamp_confidence": "number (0-1)",
  "ai_evidence_quality": "number (0-1)",
  "ai_uncertainty_note": "string | null",
  "human_reviewer_id": "uuid | null",
  "reviewer_note": "string | null",
  "reviewed_at": "ISO8601 | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### DuplicateCandidate
```json
{
  "id": "uuid",
  "incident_id": "uuid",
  "candidate_id": "uuid",
  "similarity_score": "number (0-1)",
  "similarity_reasons": ["location_proximity", "time_window", "description_match"],
  "status": "pending | resolved_duplicate | resolved_unique"
}
```

### Road
```json
{
  "id": "uuid",
  "name": "string",
  "highway_ref": "string | null",
  "district": "string",
  "status": "RoadStatus",
  "lat_start": "number",
  "lng_start": "number",
  "lat_end": "number",
  "lng_end": "number",
  "geometry": { "type": "LineString", "coordinates": [[lng, lat]] },
  "strategic_importance": "StrategicImportance",
  "last_updated": "ISO8601",
  "closure_history": "RoadClosure[]"
}
```

### RoadClosure
```json
{
  "id": "uuid",
  "road_id": "uuid",
  "reason": "string",
  "severity": "RoadClosureSeverity",
  "closure_lat": "number",
  "closure_lng": "number",
  "description": "string",
  "reported_by": "uuid",
  "verified_by": "uuid | null",
  "opened_at": "ISO8601",
  "closed_at": "ISO8601 | null",
  "is_active": "boolean"
}
```

### Route
```json
{
  "id": "string",
  "segments": [
    { "road_id": "uuid", "road_name": "string", "distance_km": "number", "status": "RoadStatus" }
  ],
  "total_distance_km": "number",
  "estimated_duration_min": "number",
  "is_recommended": "boolean",
  "warnings": ["string"]
}
```

### Settlement
```json
{
  "id": "uuid",
  "name": "string",
  "district": "string",
  "lat": "number",
  "lng": "number",
  "population": "number",
  "is_isolated": "boolean",
  "isolation_reason": "string | null",
  "last_road_access": "ISO8601 | null",
  "needs_aerial": "boolean"
}
```

### Facility
```json
{
  "id": "uuid",
  "name": "string",
  "type": "FacilityType",
  "district": "string",
  "lat": "number",
  "lng": "number",
  "capacity": "number",
  "current_occupancy": "number",
  "is_accessible": "boolean",
  "last_verified": "ISO8601"
}
```

### ReliefRequest
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "priority": "ReliefPriority",
  "status": "ReliefStatus",
  "district": "string",
  "lat": "number",
  "lng": "number",
  "requested_by": "uuid",
  "needs": [
    { "category": "InventoryCategory", "item_name": "string", "quantity": "number", "unit": "string" }
  ],
  "beneficiary_count": "number",
  "assigned_team_id": "uuid | null",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### InventoryItem
```json
{
  "id": "uuid",
  "warehouse_id": "uuid",
  "warehouse_name": "string",
  "item_name": "string",
  "category": "InventoryCategory",
  "unit": "string",
  "quantity_available": "number",
  "quantity_reserved": "number",
  "last_updated": "ISO8601"
}
```

### Allocation
```json
{
  "id": "uuid",
  "request_id": "uuid",
  "inventory_item_id": "uuid",
  "quantity_allocated": "number",
  "ai_recommendation": "boolean",
  "ai_reasoning": "string | null",
  "approved_by": "uuid | null",
  "approved_at": "ISO8601 | null",
  "status": "AllocationStatus"
}
```

### Delivery
```json
{
  "id": "uuid",
  "allocation_id": "uuid",
  "team_id": "uuid",
  "status": "DeliveryStatus",
  "estimated_delivery": "ISO8601 | null",
  "actual_delivery": "ISO8601 | null",
  "current_lat": "number | null",
  "current_lng": "number | null",
  "tracking_notes": [
    { "timestamp": "ISO8601", "note": "string", "lat": "number | null", "lng": "number | null" }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

### Error Response
```json
{
  "error": "string (human-readable message)",
  "code": "string (machine-readable code)",
  "details": "any (optional, validation errors etc.)"
}
```

| HTTP Status | Code | Meaning |
|-------------|------|---------|
| 400 | `BAD_REQUEST` | Malformed request body or query params |
| 401 | `UNAUTHORIZED` | Missing or invalid token |
| 403 | `FORBIDDEN` | Valid token but insufficient role |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Duplicate or state conflict |
| 422 | `VALIDATION_ERROR` | Schema validation failed |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Module 0 — Auth

### POST /api/auth/login

Authenticate a user and obtain a JWT bearer token.

**Auth required:** No

**Request Body**
```json
{
  "username": "string (email or username)",
  "password": "string"
}
```

**Response `200 OK`**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "uuid",
    "name": "string",
    "role": "UserRole",
    "district": "string"
  }
}
```

**Errors:** `401 UNAUTHORIZED` — invalid credentials.

---

### GET /api/auth/me

Return the authenticated user's profile.

**Auth required:** Yes

**Response `200 OK`** — Full `User` object (see Common Schemas).

**Errors:** `401 UNAUTHORIZED`

---

## Module 1 — AAPDA Lens (Incidents)

### GET /api/incidents

List incidents with optional filters and pagination.

**Auth required:** Yes (all roles)

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `IncidentStatus` | Filter by status |
| `severity` | `IncidentSeverity` | Filter by severity |
| `district` | `string` | Filter by district name |
| `type` | `IncidentType` | Filter by incident type |
| `page` | `integer ≥ 1` | Page number (default: 1) |
| `limit` | `integer 1–100` | Items per page (default: 20) |

**Response `200 OK`**
```json
{
  "data": ["Incident[]"],
  "total": "number",
  "page": "number",
  "limit": "number",
  "total_pages": "number"
}
```

**Errors:** `401`, `422`

---

### POST /api/incidents

Create a new incident report.

**Auth required:** Yes

**Request Body**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "type": "IncidentType (required)",
  "severity": "IncidentSeverity (required)",
  "lat": "number (required, decimal degrees)",
  "lng": "number (required, decimal degrees)",
  "district": "string (required)",
  "source": "IncidentSource (required)",
  "evidence": [
    { "type": "image|video|text", "url": "string", "caption": "string" }
  ]
}
```

**Response `201 Created`** — Full `Incident` object with AI confidence scores populated.

**Errors:** `400`, `401`, `422`

---

### GET /api/incidents/:id

Retrieve a single incident including its evidence array.

**Auth required:** Yes

**Response `200 OK`** — Full `Incident` object.

**Errors:** `401`, `404`

---

### PATCH /api/incidents/:id/status

Update incident status after human review.

**Auth required:** Yes (`ddma_officer`, `field_officer`, `admin`)

**Request Body**
```json
{
  "status": "IncidentStatus (required)",
  "reviewer_note": "string (optional)"
}
```

**Response `200 OK`** — Updated `Incident` object.

**Errors:** `400`, `401`, `403`, `404`, `409 CONFLICT` (invalid status transition)

---

### GET /api/incidents/:id/duplicates

Retrieve AI-detected duplicate candidates for an incident.

**Auth required:** Yes (`ddma_officer`, `field_officer`, `admin`)

**Response `200 OK`**
```json
{
  "duplicates": ["DuplicateCandidate[]"],
  "count": "number"
}
```

**Errors:** `401`, `403`, `404`

---

### POST /api/incidents/:id/verify

Human reviewer action: verify, reject, or merge an incident.

> ⚠️ **AI recommends; human must explicitly call this endpoint to confirm.**

**Auth required:** Yes (`ddma_officer`, `field_officer`, `admin`)

**Request Body**
```json
{
  "action": "verify | reject | merge (required)",
  "target_id": "uuid (required when action=merge — the canonical incident to merge into)",
  "reviewer_note": "string (optional)"
}
```

**Response `200 OK`** — Updated `Incident` object with new status.

**Errors:** `400`, `401`, `403`, `404`, `409`

---

## Module 2 — MargRakshak (Roads & Routes)

### GET /api/roads

List all roads with optional filters.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `RoadStatus` | Filter by road status |
| `district` | `string` | Filter by district |
| `strategic_importance` | `StrategicImportance` | Filter by importance |

**Response `200 OK`** — Array of `Road` objects (without `closure_history`).

**Errors:** `401`, `422`

---

### GET /api/roads/:id

Retrieve a single road with its full closure history.

**Auth required:** Yes

**Response `200 OK`** — `Road` object with `closure_history: RoadClosure[]`.

**Errors:** `401`, `404`

---

### POST /api/roads/:id/closure

Report a closure or blockage on a road.

**Auth required:** Yes (`field_officer`, `ddma_officer`, `admin`)

**Request Body**
```json
{
  "reason": "string (required)",
  "severity": "RoadClosureSeverity (required)",
  "lat": "number (required, closure point latitude)",
  "lng": "number (required, closure point longitude)",
  "description": "string (required)"
}
```

**Response `201 Created`** — `RoadClosure` object.

**Errors:** `400`, `401`, `403`, `404`, `422`

---

### GET /api/roads/routes

Calculate alternate routes between two geographic points.

> ℹ️ **Route suggestions are AI-assisted; field teams must verify road conditions before use.**

**Auth required:** Yes

**Query Parameters**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `from_lat` | `number` | Yes | Origin latitude |
| `from_lng` | `number` | Yes | Origin longitude |
| `to_lat` | `number` | Yes | Destination latitude |
| `to_lng` | `number` | Yes | Destination longitude |
| `max_routes` | `integer` | No | Max routes to return (default: 3) |

**Response `200 OK`**
```json
{
  "routes": ["Route[]"],
  "warnings": ["string (e.g. 'Route passes closed road NH-1A segment')"]
}
```

**Errors:** `400`, `401`, `422`

---

### GET /api/settlements

List settlements, optionally filtered to isolated ones.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `isolated` | `boolean` | If `true`, return only isolated settlements |
| `district` | `string` | Filter by district |
| `needs_aerial` | `boolean` | If `true`, return only those needing aerial access |

**Response `200 OK`** — Array of `Settlement` objects.

**Errors:** `401`, `422`

---

### GET /api/facilities

List facilities (hospitals, shelters, warehouses).

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `type` | `FacilityType` | Filter by facility type |
| `accessible` | `boolean` | If `true`, return only accessible facilities |
| `district` | `string` | Filter by district |

**Response `200 OK`** — Array of `Facility` objects.

**Errors:** `401`, `422`

---

## Module 3 — RahatGrid (Relief)

### GET /api/relief/requests

List relief requests with filters.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `ReliefStatus` | Filter by status |
| `priority` | `ReliefPriority` | Filter by priority |
| `district` | `string` | Filter by district |
| `page` | `integer ≥ 1` | Page number (default: 1) |
| `limit` | `integer 1–100` | Items per page (default: 20) |

**Response `200 OK`**
```json
{
  "data": ["ReliefRequest[]"],
  "total": "number",
  "page": "number",
  "limit": "number",
  "total_pages": "number"
}
```

**Errors:** `401`, `422`

---

### POST /api/relief/requests

Submit a new relief request.

**Auth required:** Yes

**Request Body**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "priority": "ReliefPriority (required)",
  "district": "string (required)",
  "lat": "number (required)",
  "lng": "number (required)",
  "needs": [
    {
      "category": "InventoryCategory",
      "item_name": "string",
      "quantity": "number",
      "unit": "string"
    }
  ],
  "beneficiary_count": "number (required)"
}
```

**Response `201 Created`** — Full `ReliefRequest` object.

**Errors:** `400`, `401`, `422`

---

### GET /api/relief/requests/:id

Retrieve a single relief request with its allocation history.

**Auth required:** Yes

**Response `200 OK`**
```json
{
  "request": "ReliefRequest",
  "allocations": ["Allocation[]"],
  "deliveries": ["Delivery[]"]
}
```

**Errors:** `401`, `404`

---

### PATCH /api/relief/requests/:id/status

Update the status of a relief request.

**Auth required:** Yes (`ddma_officer`, `ngo_partner`, `admin`)

**Request Body**
```json
{
  "status": "ReliefStatus (required)",
  "note": "string (optional)"
}
```

**Response `200 OK`** — Updated `ReliefRequest` object.

**Errors:** `400`, `401`, `403`, `404`, `409`

---

### GET /api/inventory

List inventory items across warehouses.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `warehouse_id` | `uuid` | Filter to a specific warehouse |
| `category` | `InventoryCategory` | Filter by item category |
| `low_stock` | `boolean` | If `true`, return items below threshold |

**Response `200 OK`** — Array of `InventoryItem` objects.

**Errors:** `401`, `422`

---

### POST /api/inventory/adjust

Adjust inventory quantity (addition or subtraction).

**Auth required:** Yes (`ddma_officer`, `admin`)

**Request Body**
```json
{
  "item_id": "uuid (required)",
  "quantity_delta": "number (required; positive = add, negative = remove)",
  "reason": "string (required)"
}
```

**Response `200 OK`** — Updated `InventoryItem` object.

**Errors:** `400`, `401`, `403`, `404`, `409 CONFLICT` (insufficient stock)

---

### GET /api/allocations

List allocations, optionally filtered by request or status.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `request_id` | `uuid` | Filter by relief request |
| `status` | `AllocationStatus` | Filter by allocation status |

**Response `200 OK`** — Array of `Allocation` objects.

**Errors:** `401`, `422`

---

### POST /api/allocations

Create an AI-recommended allocation (must be approved by a human before execution).

> ⚠️ **AI recommendation only. Status will be `proposed` until a DDMA officer calls approve.**

**Auth required:** Yes (`ddma_officer`, `ngo_partner`, `admin`)

**Request Body**
```json
{
  "request_id": "uuid (required)",
  "inventory_item_id": "uuid (required)",
  "quantity_allocated": "number (required)",
  "ai_recommendation": "boolean (true if AI-generated suggestion)",
  "ai_reasoning": "string (optional, AI explanation for the recommendation)"
}
```

**Response `201 Created`** — `Allocation` object with `status: proposed`.

**Errors:** `400`, `401`, `403`, `404`, `409`

---

### GET /api/deliveries

List deliveries with filters.

**Auth required:** Yes

**Query Parameters**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `DeliveryStatus` | Filter by delivery status |
| `team_id` | `uuid` | Filter by assigned team member |

**Response `200 OK`** — Array of `Delivery` objects.

**Errors:** `401`, `422`

---

### PATCH /api/deliveries/:id/status

Update delivery status and location (for field tracking).

**Auth required:** Yes (`field_officer`, `ddma_officer`, `admin`)

**Request Body**
```json
{
  "status": "DeliveryStatus (required)",
  "location_lat": "number (optional, current GPS lat)",
  "location_lng": "number (optional, current GPS lng)",
  "note": "string (optional, tracking note)"
}
```

**Response `200 OK`** — Updated `Delivery` object with appended `tracking_notes` entry.

**Errors:** `400`, `401`, `403`, `404`, `409`

---

## Public Reporting (Citizen App)

### POST /api/public/report

Submit an anonymous or authenticated incident report from the public.

**Auth required:** No

**Request Body**
```json
{
  "title": "string (required)",
  "description": "string (required)",
  "type": "IncidentType (required)",
  "severity": "IncidentSeverity (required)",
  "lat": "number (required)",
  "lng": "number (required)",
  "district": "string (required)",
  "reporter_name": "string (optional)",
  "reporter_phone": "string (optional)",
  "evidence": [
    { "type": "image|video|text", "url": "string", "caption": "string" }
  ]
}
```

**Response `201 Created`**
```json
{
  "id": "uuid (internal incident id)",
  "message": "string (human-readable confirmation)",
  "tracking_id": "string (short alphanumeric, e.g. AAPDA-2024-00123)"
}
```

**Errors:** `400`, `422`

---

### GET /api/public/report/:tracking_id

Check the status of a submitted public report.

**Auth required:** No

**Response `200 OK`**
```json
{
  "tracking_id": "string",
  "status": "IncidentStatus",
  "incident_id": "uuid (present once verified)",
  "message": "string (human-readable status description)",
  "last_updated": "ISO8601"
}
```

**Errors:** `404`

---

*Last updated: 2024 — AAPDA Grid Hackathon*
