# SuperAdmin API Endpoints Documentation

This document outlines all the API endpoints required by the SuperAdmin frontend. Each endpoint is documented with its HTTP method, request/response formats, authentication requirements, and error handling.

## Base Configuration

- **Base URL**: `/api/superadmin`
- **Authentication**: Bearer JWT token required for all endpoints
- **Content-Type**: `application/json`
- **Error Response Format**:

```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-15T14:30:00Z"
}
```

## Authentication & Authorization

### Headers Required

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Role-Based Access

- `SUPERADMIN`: Full access to all endpoints
- `ADMIN`: Limited access based on assigned elections
- `APPROVER`: Read access + approval actions
- `ORCHESTRATOR`: System management + election control

---

## 1. Dashboard Endpoints

### GET `/api/superadmin/dashboard`

**Purpose**: Fetch dashboard overview data
**Auth**: SUPERADMIN required

**Response**:

```json
{
  "superadminId": "uuid",
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
      "id": "uuid",
      "action": "Election Created",
      "details": "Student Union Executive Elections 2024",
      "timestamp": "2024-03-15T14:30:00Z",
      "type": "election"
    }
  ],
  "upcomingElections": [
    {
      "id": "uuid",
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
```

---

## 2. Elections Endpoints

### GET `/api/superadmin/elections`

**Purpose**: List all elections with pagination and filtering
**Auth**: SUPERADMIN, ADMIN, APPROVER

**Query Parameters**:

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by election status
- `search` (optional): Search in title/description
- `created_by` (optional): Filter by creator ID

**Response**:

```json
{
  "elections": [
    {
      "id": "uuid",
      "title": "Student Union Executive Elections 2024",
      "description": "Annual elections for executive positions",
      "status": "LIVE",
      "start_time": "2024-03-15T09:00:00Z",
      "end_time": "2024-03-17T17:00:00Z",
      "created_at": "2024-02-15T10:00:00Z",
      "updated_at": "2024-03-15T08:00:00Z",
      "created_by": "uuid",
      "approved_by": "uuid",
      "creator": {
        "id": "uuid",
        "full_name": "Dr. Sarah Williams",
        "email": "sarah.williams@university.edu"
      },
      "portfolios": [
        {
          "id": "uuid",
          "title": "President",
          "description": "Student Union President",
          "election_id": "uuid",
          "created_at": "2024-02-16T10:00:00Z"
        }
      ],
      "candidates": [
        {
          "id": "uuid",
          "full_name": "John Smith",
          "photo_url": "https://example.com/photo.jpg",
          "manifesto": "My vision for the university...",
          "portfolio_id": "uuid",
          "election_id": "uuid",
          "created_at": "2024-02-18T10:00:00Z"
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### GET `/api/superadmin/elections/:id`

**Purpose**: Get detailed election information
**Auth**: SUPERADMIN, ADMIN (if assigned), APPROVER

**Response**: Same as election object above with full details

### POST `/api/superadmin/elections`

**Purpose**: Create new election
**Auth**: SUPERADMIN, ADMIN

**Request Body**:

```json
{
  "title": "New Election Title",
  "description": "Election description",
  "start_time": "2024-04-01T09:00:00Z",
  "end_time": "2024-04-03T17:00:00Z",
  "portfolios": [
    {
      "title": "President",
      "description": "Student Union President"
    }
  ]
}
```

**Response**: Created election object (201 status)

### PUT `/api/superadmin/elections/:id`

**Purpose**: Update election
**Auth**: SUPERADMIN, ADMIN (if assigned)

**Request Body**: Same as POST but all fields optional

**Response**: Updated election object

### POST `/api/superadmin/elections/:id/approve`

**Purpose**: Approve pending election
**Auth**: APPROVER, SUPERADMIN

**Request Body**:

```json
{
  "comments": "Approval comments"
}
```

**Response**:

```json
{
  "success": true,
  "message": "Election approved successfully",
  "election": {
    /* updated election object */
  }
}
```

### POST `/api/superadmin/elections/:id/start`

**Purpose**: Start approved election
**Auth**: ORCHESTRATOR, SUPERADMIN

**Response**:

```json
{
  "success": true,
  "message": "Election started successfully",
  "startTime": "2024-03-15T09:00:00Z"
}
```

### POST `/api/superadmin/elections/:id/end`

**Purpose**: End live election
**Auth**: ORCHESTRATOR, SUPERADMIN

**Response**:

```json
{
  "success": true,
  "message": "Election ended successfully",
  "endTime": "2024-03-17T17:00:00Z"
}
```

---

## 3. Analytics Endpoints

### GET `/api/superadmin/analytics`

**Purpose**: Get analytics overview for all elections
**Auth**: SUPERADMIN, ADMIN, APPROVER

**Response**:

```json
{
  "elections": [
    {
      "id": "uuid",
      "title": "Student Union Executive Elections 2024",
      "status": "CLOSED",
      "totalVotes": 1847,
      "totalVoters": 2500,
      "turnoutPercentage": 73.8,
      "portfolios": [
        {
          "id": "uuid",
          "title": "President",
          "totalVotes": 1847,
          "topCandidate": {
            "name": "John Smith",
            "votes": 892,
            "percentage": 48.3
          }
        }
      ]
    }
  ]
}
```

### GET `/api/superadmin/analytics/:electionId`

**Purpose**: Get detailed analytics for specific election
**Auth**: SUPERADMIN, ADMIN (if assigned), APPROVER

**Response**:

```json
{
  "election": {
    "id": "uuid",
    "title": "Student Union Executive Elections 2024",
    "status": "CLOSED",
    "start_time": "2024-03-15T09:00:00Z",
    "end_time": "2024-03-17T17:00:00Z"
  },
  "portfolios": [
    {
      "id": "uuid",
      "title": "President",
      "candidates": [
        {
          "id": "uuid",
          "name": "John Smith",
          "votes": 892,
          "percentage": 48.3
        },
        {
          "id": "uuid",
          "name": "Jane Doe",
          "votes": 755,
          "percentage": 40.9
        }
      ]
    }
  ],
  "overallStats": {
    "totalVotes": 1847,
    "turnoutPercentage": 73.8,
    "completionRate": 98.2
  }
}
```

---

## 4. Admin Management Endpoints

### GET `/api/superadmin/admins`

**Purpose**: List all admin users
**Auth**: SUPERADMIN

**Query Parameters**:

- `page`, `limit`: Pagination
- `role`: Filter by role
- `status`: Filter by status
- `search`: Search by name/email

**Response**:

```json
{
  "admins": [
    {
      "id": "uuid",
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
      },
      "assigned_elections": ["uuid1", "uuid2"]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10
  }
}
```

### POST `/api/superadmin/admins`

**Purpose**: Create new admin user
**Auth**: SUPERADMIN

**Request Body**:

```json
{
  "full_name": "New Admin Name",
  "email": "admin@university.edu",
  "role": "ADMIN",
  "password": "temporary_password"
}
```

**Response**: Created admin object (201 status)

### PUT `/api/superadmin/admins/:id`

**Purpose**: Update admin user
**Auth**: SUPERADMIN

**Request Body**:

```json
{
  "full_name": "Updated Name",
  "role": "APPROVER",
  "status": "INACTIVE"
}
```

**Response**: Updated admin object

### POST `/api/superadmin/admins/:adminId/assign/:electionId`

**Purpose**: Assign admin to election
**Auth**: SUPERADMIN

**Response**:

```json
{
  "success": true,
  "message": "Admin assigned successfully",
  "assignment": {
    "id": "uuid",
    "admin_id": "uuid",
    "election_id": "uuid",
    "assigned_by": "uuid",
    "created_at": "2024-03-15T14:30:00Z"
  }
}
```

### DELETE `/api/superadmin/admins/:adminId/unassign/:electionId`

**Purpose**: Remove admin from election
**Auth**: SUPERADMIN

**Response**:

```json
{
  "success": true,
  "message": "Admin unassigned successfully"
}
```

---

## 5. Audit Trail Endpoints

### GET `/api/superadmin/audit-logs`

**Purpose**: Get system audit logs
**Auth**: SUPERADMIN, APPROVER

**Query Parameters**:

- `page`, `limit`: Pagination
- `election_id`: Filter by election
- `user_id`: Filter by user
- `action`: Filter by action type
- `start_date`, `end_date`: Date range filter

**Response**:

```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "election_id": "uuid",
      "action": "VOTE_CAST",
      "metadata": {
        "election_title": "Student Union Elections",
        "portfolios_voted": ["President", "Vice President"]
      },
      "timestamp": "2024-03-15T14:35:22Z",
      "user": {
        "full_name": "Anonymous Student",
        "role": "VOTER"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10
  }
}
```

---

## 6. System Management Endpoints

### GET `/api/superadmin/system/health`

**Purpose**: Get system health status
**Auth**: SUPERADMIN, ORCHESTRATOR

**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2024-03-15T14:30:00Z",
  "metrics": {
    "uptime": "99.9%",
    "activeUsers": 156,
    "systemLoad": 23,
    "memoryUsage": 67,
    "diskUsage": 45,
    "databaseConnections": 12
  },
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "email": "healthy",
    "storage": "healthy"
  }
}
```

### POST `/api/superadmin/invitations`

**Purpose**: Send invitation to new user
**Auth**: SUPERADMIN

**Request Body**:

```json
{
  "email": "newuser@university.edu",
  "role": "ADMIN",
  "expires_in_hours": 72
}
```

**Response**:

```json
{
  "success": true,
  "message": "Invitation sent successfully",
  "invitation": {
    "id": "uuid",
    "email": "newuser@university.edu",
    "token": "secure_token_here",
    "role": "ADMIN",
    "expires_at": "2024-03-18T14:30:00Z",
    "created_at": "2024-03-15T14:30:00Z"
  }
}
```

### GET `/api/superadmin/invitations`

**Purpose**: List pending invitations
**Auth**: SUPERADMIN

**Response**:

```json
{
  "invitations": [
    {
      "id": "uuid",
      "email": "pending@university.edu",
      "role": "ADMIN",
      "expires_at": "2024-03-18T14:30:00Z",
      "used": false,
      "created_at": "2024-03-15T14:30:00Z"
    }
  ]
}
```

---

## Error Handling

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity (business logic errors)
- `500`: Internal Server Error

### Common Error Responses

**400 - Validation Error**:

```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": ["Title is required"],
    "start_time": ["Start time must be in the future"]
  }
}
```

**401 - Unauthorized**:

```json
{
  "error": true,
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**403 - Forbidden**:

```json
{
  "error": true,
  "message": "Insufficient permissions",
  "code": "FORBIDDEN",
  "required_role": "SUPERADMIN"
}
```

---

## Database Queries Reference

### Key Prisma Queries for Backend Implementation

**Dashboard Statistics**:

```sql
-- Active Elections
SELECT COUNT(*) FROM Elections WHERE status = 'LIVE';

-- Total Votes
SELECT COUNT(*) FROM Votes;

-- Recent Activity (from AuditTrail)
SELECT * FROM AuditTrail
ORDER BY timestamp DESC
LIMIT 10;
```

**Election with Relations**:

```sql
SELECT e.*, u.full_name as creator_name,
       COUNT(DISTINCT p.id) as portfolio_count,
       COUNT(DISTINCT c.id) as candidate_count,
       COUNT(DISTINCT v.id) as vote_count
FROM Elections e
LEFT JOIN Users u ON e.created_by = u.id
LEFT JOIN Portfolios p ON e.id = p.election_id
LEFT JOIN Candidates c ON e.id = c.election_id
LEFT JOIN Votes v ON e.id = v.election_id
WHERE e.id = $1
GROUP BY e.id, u.full_name;
```

**Analytics Data**:

```sql
SELECT p.title as portfolio_title,
       c.full_name as candidate_name,
       COUNT(v.id) as vote_count,
       ROUND(COUNT(v.id) * 100.0 /
         (SELECT COUNT(*) FROM Votes WHERE election_id = $1), 2) as percentage
FROM Portfolios p
JOIN Candidates c ON p.id = c.portfolio_id
LEFT JOIN Votes v ON c.id = v.candidate_id
WHERE p.election_id = $1
GROUP BY p.id, p.title, c.id, c.full_name
ORDER BY vote_count DESC;
```

This documentation provides the backend developer with everything needed to implement the API endpoints that match the frontend expectations.
