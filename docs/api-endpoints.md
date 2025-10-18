# API Endpoints Documentation for University E-Voting System

## Table of Contents

1. [Authentication](#authentication)
2. [Dashboard Endpoints](#dashboard-endpoints)
3. [Elections Management](#elections-management)
4. [Analytics Endpoints](#analytics-endpoints)
5. [User Management](#user-management)
6. [Audit Logs](#audit-logs)
7. [Data Types](#data-types)
8. [Error Handling](#error-handling)

---

## Authentication

All API endpoints require authentication. The frontend expects JWT tokens to be included in the Authorization header.

```
Authorization: Bearer <jwt_token>
```

### Authentication Endpoints

#### POST /api/auth/login

Login user and return JWT token.

**Request:**

```json
{
  "email": "admin@university.edu",
  "password": "securepassword"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "full_name": "Dr. Sarah Williams",
      "email": "admin@university.edu",
      "role": "SUPERADMIN",
      "status": "ACTIVE"
    }
  }
}
```

#### POST /api/auth/refresh

Refresh JWT token.

**Request:**

```json
{
  "refresh_token": "refresh_token_here"
}
```

---

## Dashboard Endpoints

### GET /api/superadmin/dashboard

Get dashboard overview data for superadmin.

**Query Parameters:**

- `period` (optional): "day", "week", "month", "year" - defaults to "month"

**Response:**

```json
{
  "success": true,
  "data": {
    "superadminId": "superadmin-uuid",
    "overview": {
      "totalElections": 12,
      "activeElections": 3,
      "completedElections": 8,
      "pendingElections": 2,
      "draftElections": 1,
      "totalVotes": 4521,
      "totalUsers": 5200,
      "totalAdmins": 15,
      "totalPortfolios": 28,
      "totalCandidates": 45
    },
    "recentActivity": [
      {
        "id": "activity-uuid",
        "action": "ELECTION_CREATED",
        "details": "Student Union Executive Elections 2024",
        "timestamp": "2024-03-15T14:30:00Z",
        "type": "election"
      }
    ],
    "upcomingElections": [
      {
        "id": "election-uuid",
        "title": "Student Union Executive Elections 2024",
        "start_time": "2024-03-15T09:00:00Z",
        "status": "APPROVED"
      }
    ],
    "systemHealth": {
      "status": "healthy",
      "uptime": "99.9%",
      "activeUsers": 156,
      "systemLoad": 23,
      "databaseConnections": 12,
      "pendingInvitations": 3
    }
  }
}
```

---

## Elections Management

### GET /api/elections

Get paginated list of elections.

**Query Parameters:**

- `page` (optional): Page number, defaults to 1
- `limit` (optional): Items per page, defaults to 10
- `status` (optional): Filter by status ("DRAFT", "PENDING_APPROVAL", "APPROVED", "LIVE", "CLOSED", "ARCHIVED")
- `search` (optional): Search by title or description
- `created_by` (optional): Filter by creator user ID

**Response:**

```json
{
  "success": true,
  "data": {
    "elections": [
      {
        "id": "election-uuid",
        "title": "Student Union Executive Elections 2024",
        "description": "Annual elections for executive positions",
        "status": "LIVE",
        "start_time": "2024-03-15T09:00:00Z",
        "end_time": "2024-03-17T17:00:00Z",
        "created_at": "2024-02-15T10:00:00Z",
        "updated_at": "2024-03-15T08:00:00Z",
        "created_by": "admin-uuid",
        "approved_by": "approver-uuid",
        "creator": {
          "id": "admin-uuid",
          "full_name": "Dr. Sarah Williams",
          "email": "sarah.williams@university.edu"
        },
        "portfolios": [
          {
            "id": "portfolio-uuid",
            "title": "President",
            "description": "Student Union President",
            "election_id": "election-uuid",
            "created_at": "2024-02-15T10:30:00Z"
          }
        ]
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10
    }
  }
}
```

### GET /api/elections/:id

Get detailed election information.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "election-uuid",
    "title": "Student Union Executive Elections 2024",
    "description": "Annual elections for executive positions",
    "status": "LIVE",
    "start_time": "2024-03-15T09:00:00Z",
    "end_time": "2024-03-17T17:00:00Z",
    "created_at": "2024-02-15T10:00:00Z",
    "updated_at": "2024-03-15T08:00:00Z",
    "created_by": "admin-uuid",
    "approved_by": "approver-uuid",
    "portfolios": [...],
    "candidates": [...],
    "ballots": [...],
    "adminAssignments": [...]
  }
}
```

### POST /api/elections

Create a new election.

**Request:**

```json
{
  "title": "Faculty Representative Elections",
  "description": "Elections for faculty representatives",
  "start_time": "2024-04-01T08:00:00Z",
  "end_time": "2024-04-03T20:00:00Z",
  "portfolios": [
    {
      "title": "Computer Science Rep",
      "description": "Representative for Computer Science Department"
    }
  ]
}
```

### PUT /api/elections/:id

Update election details.

**Request:** (partial update supported)

```json
{
  "title": "Updated Election Title",
  "status": "APPROVED",
  "approved_by": "approver-uuid"
}
```

### DELETE /api/elections/:id

Soft delete an election (set status to ARCHIVED).

---

## Analytics Endpoints

### GET /api/analytics

Get overall analytics across all elections.

**Query Parameters:**

- `period` (optional): "day", "week", "month", "year"
- `status` (optional): Filter by election status

**Response:**

```json
{
  "success": true,
  "data": {
    "overallStats": {
      "totalElections": 12,
      "totalVotes": 4521,
      "averageTurnout": 73.2,
      "completionRate": 89.5
    },
    "trendData": [
      {
        "date": "2024-03-01",
        "elections": 2,
        "votes": 450,
        "turnout": 78.3
      }
    ]
  }
}
```

### GET /api/analytics/:electionId

Get detailed analytics for a specific election.

**Response:**

```json
{
  "success": true,
  "data": {
    "election": {
      "id": "election-uuid",
      "title": "Student Union Executive Elections 2024",
      "status": "CLOSED",
      "start_time": "2024-03-15T09:00:00Z",
      "end_time": "2024-03-17T17:00:00Z"
    },
    "portfolios": [
      {
        "id": "portfolio-uuid",
        "title": "President",
        "candidates": [
          {
            "id": "candidate-uuid",
            "name": "John Smith",
            "votes": 1245,
            "percentage": 42.3
          }
        ]
      }
    ],
    "overallStats": {
      "totalVotes": 2945,
      "turnoutPercentage": 76.8,
      "completionRate": 94.2
    }
  }
}
```

---

## User Management

### GET /api/users

Get paginated list of users/admins.

**Query Parameters:**

- `page`, `limit`: Pagination
- `role`: Filter by role ("ADMIN", "SUPERADMIN", "APPROVER", "ORCHESTRATOR")
- `status`: Filter by status ("ACTIVE", "INACTIVE", "SUSPENDED")
- `search`: Search by name or email

**Response:**

```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "id": "user-uuid",
        "full_name": "Dr. Sarah Williams",
        "email": "sarah.williams@university.edu",
        "role": "SUPERADMIN",
        "status": "ACTIVE",
        "created_at": "2023-09-01T08:00:00Z",
        "updated_at": "2024-03-15T14:30:00Z",
        "stats": {
          "total_elections_created": 8,
          "total_elections_approved": 15,
          "total_votes_processed": 5420,
          "last_login": "2024-03-15T14:30:00Z"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "itemsPerPage": 10
    }
  }
}
```

### POST /api/users

Create a new user account.

**Request:**

```json
{
  "full_name": "New Admin User",
  "email": "new.admin@university.edu",
  "password": "temporaryPassword123",
  "role": "ADMIN"
}
```

### PUT /api/users/:id

Update user details.

**Request:**

```json
{
  "full_name": "Updated Name",
  "status": "INACTIVE",
  "role": "ADMIN"
}
```

### POST /api/admin-assignments

Assign admin to election.

**Request:**

```json
{
  "admin_id": "admin-uuid",
  "election_id": "election-uuid"
}
```

---

## Audit Logs

### GET /api/audit-logs

Get paginated audit trail.

**Query Parameters:**

- `page`, `limit`: Pagination
- `user_id`: Filter by user
- `election_id`: Filter by election
- `action`: Filter by action type
- `start_date`, `end_date`: Date range

**Response:**

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "audit-uuid",
        "user_id": "user-uuid",
        "election_id": "election-uuid",
        "action": "ELECTION_STATUS_CHANGED",
        "metadata": {
          "previous_status": "APPROVED",
          "new_status": "LIVE",
          "reason": "Scheduled start time reached"
        },
        "timestamp": "2024-03-15T14:30:15Z",
        "user": {
          "full_name": "Dr. Sarah Williams",
          "email": "sarah.williams@university.edu",
          "role": "SUPERADMIN"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 45,
      "totalItems": 450,
      "itemsPerPage": 10
    }
  }
}
```

---

## Data Types

### Core Prisma Types

```typescript
// User roles from Prisma enum
type Role = "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";

// User statuses from Prisma enum
type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

// Election statuses from Prisma enum
type ElectionStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "LIVE"
  | "CLOSED"
  | "ARCHIVED";
```

### API Response Wrapper

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## Error Handling

### Standard Error Codes

| Code               | HTTP Status | Description                       |
| ------------------ | ----------- | --------------------------------- |
| `INVALID_REQUEST`  | 400         | Malformed request data            |
| `UNAUTHORIZED`     | 401         | Invalid or missing authentication |
| `FORBIDDEN`        | 403         | Insufficient permissions          |
| `NOT_FOUND`        | 404         | Resource not found                |
| `VALIDATION_ERROR` | 422         | Request validation failed         |
| `INTERNAL_ERROR`   | 500         | Server-side error                 |
| `DATABASE_ERROR`   | 500         | Database operation failed         |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "meta": {
    "timestamp": "2024-03-15T14:30:00Z",
    "requestId": "req_12345"
  }
}
```

### Field Validation

#### User Fields

- `email`: Valid email format, unique in database
- `full_name`: 2-100 characters, required
- `password`: Minimum 8 characters, required for creation
- `role`: Must be valid enum value
- `status`: Must be valid enum value

#### Election Fields

- `title`: 3-200 characters, required
- `description`: Optional, max 1000 characters
- `start_time`: Future datetime, required
- `end_time`: After start_time, required
- `status`: Must be valid enum value

### Rate Limiting

API endpoints are rate limited:

- Authentication endpoints: 5 requests per minute
- Data modification endpoints: 30 requests per minute
- Read-only endpoints: 100 requests per minute

### Request/Response Headers

**Required Request Headers:**

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Response Headers:**

```
Content-Type: application/json
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1679755200
```
