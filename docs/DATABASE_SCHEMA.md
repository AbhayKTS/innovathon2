# Database Schema — AAPDA Grid

> **RDBMS target:** PostgreSQL 15+  
> **Extension required:** `uuid-ossp` (for `uuid_generate_v4()`), `postgis` (optional, for spatial queries)  
> **Conventions:** All PKs are UUID v4; timestamps in UTC; JSONB for flexible semi-structured data.

---

## Entity-Relationship Overview

```
users
  ├── incidents (reporter_id, human_reviewer_id)
  │     └── incident_duplicates (incident_id, candidate_id, resolved_by)
  ├── roads (updated_by)
  │     └── road_closures (road_id, reported_by, verified_by)
  ├── relief_requests (requested_by, assigned_team_id)
  │     └── allocations (request_id, approved_by)
  │           └── deliveries (allocation_id, team_id)
  ├── inventory (warehouse_id → facilities, updated_by)
  ├── facilities
  └── audit_log (performed_by)
settlements (standalone — linked via district/lat/lng)
```

---

## Tables

### 1. `users`

```sql
CREATE TABLE users (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,                       -- bcrypt/argon2
  role         VARCHAR(50)  NOT NULL
                CHECK (role IN ('citizen','field_officer','ddma_officer','ngo_partner','admin')),
  district     VARCHAR(100),                               -- primary district assignment
  phone        VARCHAR(20),
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN users.role IS 'citizen | field_officer | ddma_officer | ngo_partner | admin';
COMMENT ON COLUMN users.district IS 'Primary district for field officers / DDMA officers; NULL for admins';
```

---

### 2. `incidents`

```sql
CREATE TABLE incidents (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                    VARCHAR(500) NOT NULL,
  description              TEXT        NOT NULL,
  type                     VARCHAR(50)  NOT NULL
                            CHECK (type IN ('road_block','flood','landslide','avalanche','bridge_damage','other')),
  status                   VARCHAR(50)  NOT NULL DEFAULT 'reported'
                            CHECK (status IN ('reported','under_review','verified','rejected','merged')),
  severity                 VARCHAR(20)  NOT NULL
                            CHECK (severity IN ('low','medium','high','critical')),
  lat                      DECIMAL(10,7) NOT NULL,          -- WGS84 latitude
  lng                      DECIMAL(10,7) NOT NULL,          -- WGS84 longitude
  district                 VARCHAR(100) NOT NULL,
  source                   VARCHAR(50)  NOT NULL
                            CHECK (source IN ('citizen_app','field_officer','social_media','ngo','ddma')),

  reporter_id              UUID         REFERENCES users(id) ON DELETE SET NULL,

  -- Flexible evidence array: [{type, url, caption}]
  evidence                 JSONB        NOT NULL DEFAULT '[]'::JSONB,

  -- AI-generated scores (0.0 – 1.0); NULL until AI pipeline runs
  ai_duplicate_score       DECIMAL(5,4) CHECK (ai_duplicate_score BETWEEN 0 AND 1),
  ai_location_confidence   DECIMAL(5,4) CHECK (ai_location_confidence BETWEEN 0 AND 1),
  ai_timestamp_confidence  DECIMAL(5,4) CHECK (ai_timestamp_confidence BETWEEN 0 AND 1),
  ai_evidence_quality      DECIMAL(5,4) CHECK (ai_evidence_quality BETWEEN 0 AND 1),
  ai_uncertainty_note      TEXT,                           -- human-readable AI caveat

  -- Human review fields
  human_reviewer_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  reviewer_note            TEXT,
  reviewed_at              TIMESTAMPTZ,

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN incidents.evidence IS 'Array of evidence objects: [{type: image|video|text, url, caption}]';
COMMENT ON COLUMN incidents.ai_duplicate_score IS 'AI probability this incident duplicates another (0=unique, 1=certain duplicate)';
COMMENT ON COLUMN incidents.ai_uncertainty_note IS 'AI-generated plain-English note when confidence is low';
```

---

### 3. `incident_duplicates`

```sql
CREATE TABLE incident_duplicates (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  incident_id        UUID        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  candidate_id       UUID        NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  similarity_score   DECIMAL(5,4) NOT NULL CHECK (similarity_score BETWEEN 0 AND 1),
  -- e.g. ["location_proximity", "time_window", "description_match"]
  similarity_reasons JSONB       NOT NULL DEFAULT '[]'::JSONB,
  status             VARCHAR(30)  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','resolved_duplicate','resolved_unique')),
  resolved_by        UUID         REFERENCES users(id) ON DELETE SET NULL,
  resolved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT no_self_duplicate CHECK (incident_id <> candidate_id),
  CONSTRAINT unique_pair UNIQUE (incident_id, candidate_id)
);

COMMENT ON TABLE incident_duplicates IS 'AI-flagged potential duplicates; human must resolve each pair';
COMMENT ON COLUMN incident_duplicates.similarity_reasons IS 'Array of reason tags explaining why AI flagged as duplicate';
```

---

### 4. `roads`

```sql
CREATE TABLE roads (
  id                   UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 VARCHAR(500) NOT NULL,
  highway_ref          VARCHAR(50),                        -- e.g. NH-1A, SH-23
  district             VARCHAR(100) NOT NULL,
  status               VARCHAR(20)  NOT NULL DEFAULT 'unknown'
                        CHECK (status IN ('open','partial','closed','unknown')),
  lat_start            DECIMAL(10,7) NOT NULL,
  lng_start            DECIMAL(10,7) NOT NULL,
  lat_end              DECIMAL(10,7) NOT NULL,
  lng_end              DECIMAL(10,7) NOT NULL,
  -- GeoJSON LineString: {"type":"LineString","coordinates":[[lng,lat],...]}
  geometry             JSONB,
  strategic_importance VARCHAR(20)  NOT NULL DEFAULT 'medium'
                        CHECK (strategic_importance IN ('critical','high','medium','low')),
  last_updated         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by           UUID         REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON COLUMN roads.geometry IS 'GeoJSON LineString for map rendering; use PostGIS geometry column if spatial queries needed';
COMMENT ON COLUMN roads.strategic_importance IS 'critical = only route to village/hospital; high = major supply route';
```

---

### 5. `road_closures`

```sql
CREATE TABLE road_closures (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  road_id       UUID        NOT NULL REFERENCES roads(id) ON DELETE CASCADE,
  reason        VARCHAR(500) NOT NULL,
  severity      VARCHAR(20)  NOT NULL
                 CHECK (severity IN ('minor','major','complete')),
  closure_lat   DECIMAL(10,7) NOT NULL,
  closure_lng   DECIMAL(10,7) NOT NULL,
  description   TEXT        NOT NULL,
  reported_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
  verified_by   UUID         REFERENCES users(id) ON DELETE SET NULL,
  opened_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),         -- when closure was reported
  closed_at     TIMESTAMPTZ,                               -- NULL = still active
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN road_closures.closure_lat IS 'Specific GPS point of the blockage (not road endpoints)';
COMMENT ON COLUMN road_closures.is_active IS 'Denormalised flag for fast filtering; kept in sync via trigger or app logic';
```

---

### 6. `settlements`

```sql
CREATE TABLE settlements (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  district          VARCHAR(100) NOT NULL,
  lat               DECIMAL(10,7) NOT NULL,
  lng               DECIMAL(10,7) NOT NULL,
  population        INTEGER     NOT NULL DEFAULT 0,
  is_isolated       BOOLEAN     NOT NULL DEFAULT FALSE,
  isolation_reason  TEXT,                                  -- e.g. "NH-1A closed due to landslide"
  last_road_access  TIMESTAMPTZ,                           -- last time road access was confirmed
  needs_aerial      BOOLEAN     NOT NULL DEFAULT FALSE,    -- requires helicopter/air drop
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN settlements.is_isolated IS 'TRUE when no road route is currently available';
COMMENT ON COLUMN settlements.needs_aerial IS 'TRUE when only viable supply method is aerial';
```

---

### 7. `facilities`

```sql
CREATE TABLE facilities (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              VARCHAR(255) NOT NULL,
  type              VARCHAR(20)  NOT NULL
                     CHECK (type IN ('hospital','shelter','warehouse')),
  district          VARCHAR(100) NOT NULL,
  lat               DECIMAL(10,7) NOT NULL,
  lng               DECIMAL(10,7) NOT NULL,
  capacity          INTEGER     NOT NULL DEFAULT 0,
  current_occupancy INTEGER     NOT NULL DEFAULT 0,
  is_accessible     BOOLEAN     NOT NULL DEFAULT TRUE,
  last_verified     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT occupancy_within_capacity CHECK (current_occupancy <= capacity)
);

COMMENT ON TABLE facilities IS 'Hospitals, shelters, and warehouses; warehouses serve as inventory locations';
```

---

### 8. `relief_requests`

```sql
CREATE TABLE relief_requests (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            VARCHAR(500) NOT NULL,
  description      TEXT        NOT NULL,
  priority         VARCHAR(20)  NOT NULL
                    CHECK (priority IN ('low','medium','high','critical')),
  status           VARCHAR(20)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','allocated','delivered','cancelled')),
  district         VARCHAR(100) NOT NULL,
  lat              DECIMAL(10,7) NOT NULL,
  lng              DECIMAL(10,7) NOT NULL,
  requested_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
  -- [{category, item_name, quantity, unit}]
  needs            JSONB        NOT NULL DEFAULT '[]'::JSONB,
  beneficiary_count INTEGER     NOT NULL DEFAULT 0,
  assigned_team_id UUID         REFERENCES users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN relief_requests.needs IS 'Array: [{category, item_name, quantity, unit}] — structured demand';
COMMENT ON COLUMN relief_requests.assigned_team_id IS 'Field officer or team lead assigned to coordinate this request';
```

---

### 9. `inventory`

```sql
CREATE TABLE inventory (
  id                 UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  warehouse_id       UUID        NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  item_name          VARCHAR(255) NOT NULL,
  category           VARCHAR(20)  NOT NULL
                      CHECK (category IN ('food','water','medicine','shelter','equipment')),
  unit               VARCHAR(50)  NOT NULL,               -- e.g. kg, litres, units, sets
  quantity_available INTEGER     NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved  INTEGER     NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  low_stock_threshold INTEGER    DEFAULT 10,
  last_updated       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by         UUID         REFERENCES users(id) ON DELETE SET NULL,

  CONSTRAINT reserved_lte_available CHECK (quantity_reserved <= quantity_available)
);

COMMENT ON COLUMN inventory.quantity_reserved IS 'Reserved for approved-but-not-yet-dispatched allocations';
COMMENT ON COLUMN inventory.low_stock_threshold IS 'Alert generated when quantity_available falls below this value';
```

---

### 10. `allocations`

```sql
CREATE TABLE allocations (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id          UUID        NOT NULL REFERENCES relief_requests(id) ON DELETE CASCADE,
  inventory_item_id   UUID        NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  quantity_allocated  INTEGER     NOT NULL CHECK (quantity_allocated > 0),
  ai_recommendation   BOOLEAN     NOT NULL DEFAULT FALSE,
  ai_reasoning        TEXT,                               -- AI plain-English explanation
  approved_by         UUID         REFERENCES users(id) ON DELETE SET NULL,
  approved_at         TIMESTAMPTZ,
  status              VARCHAR(20)  NOT NULL DEFAULT 'proposed'
                       CHECK (status IN ('proposed','approved','rejected')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE allocations IS 'Proposed (possibly AI-generated) resource allocations; require human approval before dispatch';
COMMENT ON COLUMN allocations.ai_recommendation IS 'TRUE = this allocation was surfaced by AI; FALSE = manually created';
```

---

### 11. `deliveries`

```sql
CREATE TABLE deliveries (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  allocation_id     UUID        NOT NULL REFERENCES allocations(id) ON DELETE RESTRICT,
  team_id           UUID         REFERENCES users(id) ON DELETE SET NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','in_transit','delivered','failed')),
  estimated_delivery TIMESTAMPTZ,
  actual_delivery   TIMESTAMPTZ,
  current_lat       DECIMAL(10,7),
  current_lng       DECIMAL(10,7),
  -- [{timestamp, note, lat?, lng?}]
  tracking_notes    JSONB        NOT NULL DEFAULT '[]'::JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON COLUMN deliveries.tracking_notes IS 'Append-only log of location/status updates from field teams';
```

---

### 12. `audit_log`

```sql
CREATE TABLE audit_log (
  id            BIGSERIAL   PRIMARY KEY,
  table_name    VARCHAR(100) NOT NULL,
  record_id     UUID        NOT NULL,
  action        VARCHAR(10)  NOT NULL CHECK (action IN ('insert','update','delete')),
  old_values    JSONB,                                     -- NULL for inserts
  new_values    JSONB,                                     -- NULL for deletes
  performed_by  UUID         REFERENCES users(id) ON DELETE SET NULL,
  performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_log IS 'Immutable audit trail for all sensitive write operations';
COMMENT ON COLUMN audit_log.old_values IS 'Row snapshot before the operation (NULL on INSERT)';
COMMENT ON COLUMN audit_log.new_values IS 'Row snapshot after the operation (NULL on DELETE)';
```

---

## Indexes

```sql
-- users
CREATE INDEX idx_users_role     ON users(role);
CREATE INDEX idx_users_district ON users(district);

-- incidents
CREATE INDEX idx_incidents_status    ON incidents(status);
CREATE INDEX idx_incidents_severity  ON incidents(severity);
CREATE INDEX idx_incidents_district  ON incidents(district);
CREATE INDEX idx_incidents_reporter  ON incidents(reporter_id);
CREATE INDEX idx_incidents_location  ON incidents(lat, lng);            -- bounding-box queries
CREATE INDEX idx_incidents_created   ON incidents(created_at DESC);
-- GIN index for JSONB evidence search
CREATE INDEX idx_incidents_evidence  ON incidents USING GIN (evidence);

-- incident_duplicates
CREATE INDEX idx_dupes_incident   ON incident_duplicates(incident_id);
CREATE INDEX idx_dupes_candidate  ON incident_duplicates(candidate_id);
CREATE INDEX idx_dupes_status     ON incident_duplicates(status);

-- roads
CREATE INDEX idx_roads_status    ON roads(status);
CREATE INDEX idx_roads_district  ON roads(district);
CREATE INDEX idx_roads_importance ON roads(strategic_importance);

-- road_closures
CREATE INDEX idx_closures_road      ON road_closures(road_id);
CREATE INDEX idx_closures_active    ON road_closures(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_closures_opened    ON road_closures(opened_at DESC);

-- settlements
CREATE INDEX idx_settlements_isolated ON settlements(is_isolated) WHERE is_isolated = TRUE;
CREATE INDEX idx_settlements_district ON settlements(district);

-- relief_requests
CREATE INDEX idx_requests_status    ON relief_requests(status);
CREATE INDEX idx_requests_priority  ON relief_requests(priority);
CREATE INDEX idx_requests_district  ON relief_requests(district);
CREATE INDEX idx_requests_created   ON relief_requests(created_at DESC);

-- inventory
CREATE INDEX idx_inventory_warehouse ON inventory(warehouse_id);
CREATE INDEX idx_inventory_category  ON inventory(category);

-- allocations
CREATE INDEX idx_allocations_request ON allocations(request_id);
CREATE INDEX idx_allocations_status  ON allocations(status);

-- deliveries
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_team   ON deliveries(team_id);

-- audit_log
CREATE INDEX idx_audit_table      ON audit_log(table_name);
CREATE INDEX idx_audit_record     ON audit_log(record_id);
CREATE INDEX idx_audit_performed  ON audit_log(performed_at DESC);
CREATE INDEX idx_audit_actor      ON audit_log(performed_by);
```

---

## JSONB vs Relational Trade-offs

### Where JSONB is used and why

| Column | Rationale |
|--------|-----------|
| `incidents.evidence` | Evidence types (image, video, text) vary in structure; schema evolves with app; queried by containment not by field. |
| `incidents.*` AI scores | Individual numeric columns chosen here because they are frequently filtered/sorted and benefit from B-tree indexes. |
| `incident_duplicates.similarity_reasons` | Tag array; variable length; not filtered individually. |
| `roads.geometry` | GeoJSON LineString; opaque blob for the application layer; replace with PostGIS `geometry` if spatial SQL queries needed. |
| `relief_requests.needs` | Demand list varies per request; no cross-request join on individual need items needed in MVP. |
| `deliveries.tracking_notes` | Append-only log; never queried by individual note field; total ordering by array position. |
| `audit_log.old_values / new_values` | Arbitrary row snapshots from any table; impossible to normalise. |

### When to migrate JSONB to relational columns

- **Filter on a JSONB sub-field frequently** → extract to a column + B-tree index (e.g. if querying by `evidence.type`).
- **Foreign-key integrity on a JSONB value** → move to a join table.
- **Aggregate / SUM on a JSONB numeric** → extract to a column.
- **PostGIS** → replace `roads.geometry JSONB` with `roads.geom geometry(LineString, 4326)` and add a spatial index: `CREATE INDEX idx_roads_geom ON roads USING GIST (geom);`

### Enum columns as VARCHAR with CHECK

PostgreSQL native `ENUM` types are used here as `VARCHAR + CHECK` to allow easier schema evolution (adding a new status without an `ALTER TYPE` migration). In production, evaluate using native `CREATE TYPE … AS ENUM` for type safety.

---

*Last updated: 2024 — AAPDA Grid Hackathon*
