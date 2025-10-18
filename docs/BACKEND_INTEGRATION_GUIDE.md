# Backend Developer Integration Guide

## University E-Voting System - SuperAdmin Module

### 📋 Overview

This document provides complete guidance for backend developers to integrate with the University E-Voting System's SuperAdmin frontend. The frontend is built with **Next.js 14**, **TypeScript**, **TanStack Query**, and **Tailwind CSS**, following a component-based architecture that strictly adheres to the **Prisma schema**.

---

## 🏗️ System Architecture

### Frontend Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript (strict mode)
- **Data Fetching**: TanStack Query v5
- **Styling**: Tailwind CSS with consistent amber theme
- **Database ORM**: Prisma (schema-first approach)
- **State Management**: TanStack Query for server state

### Directory Structure

```
src/
├── app/superadmin/[superadminId]/
│   ├── dashboard/page.tsx          # Main dashboard
│   ├── elections/page.tsx          # Elections management
│   ├── elections/[electionId]/page.tsx # Individual election
│   ├── analytics/page.tsx          # Overall analytics
│   ├── analytics/[electionId]/page.tsx # Election analytics
│   ├── audit-logs/page.tsx         # System audit trail
│   ├── approvals/page.tsx          # Election approvals
│   └── subadmins/page.tsx         # Admin management
├── components/ui/superadmin/       # Reusable components
├── data/                           # Mock data & types
├── types/                          # TypeScript interfaces
└── libs/prisma.ts                  # Prisma client
```

---

## 🗄️ Database Schema Integration

### Core Models (Prisma Schema Aligned)

#### Users Table

```typescript
interface User {
  id: string; // UUID primary key
  full_name: string; // User's full name
  email: string; // Unique email
  password_hash: string; // Hashed password
  role: "VOTER" | "ADMIN" | "SUPERADMIN" | "APPROVER" | "ORCHESTRATOR";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}
```

#### Elections Table

```typescript
interface Election {
  id: string; // UUID primary key
  title: string; // Election title
  description?: string; // Optional description
  status:
    | "DRAFT"
    | "PENDING_APPROVAL"
    | "APPROVED"
    | "LIVE"
    | "CLOSED"
    | "ARCHIVED";
  start_time: string; // ISO datetime
  end_time: string; // ISO datetime
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
  created_by: string; // Foreign key to Users
  approved_by?: string; // Foreign key to Users (optional)
  is_general: boolean; // True for university-wide elections
  department?: string; // Department name (when is_general = false)
}
```

#### AuditTrail Table

```typescript
interface AuditTrail {
  id: string; // UUID primary key
  user_id: string; // Foreign key to Users
  election_id?: string; // Foreign key to Elections (optional)
  action: string; // Action description
  metadata: any; // JSON metadata
  timestamp: string; // ISO datetime
}
```

---

## 🔌 API Endpoints Required

### Authentication & Authorization

#### POST /api/auth/login

```typescript
Request: {
  email: string;
  password: string;
}

Response: {
  user: User;
  token: string;
  expires: string;
}
```

#### POST /api/auth/logout

```typescript
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  success: boolean;
}
```

### Dashboard APIs

#### GET /api/superadmin/[superadminId]/dashboard

```typescript
Headers: {
  Authorization: "Bearer <token>"
}

Response: {
  superadminId: string;
  overview: {
    totalElections: number;
    activeElections: number;        // status = 'LIVE'
    completedElections: number;     // status = 'CLOSED'
    pendingElections: number;       // status = 'PENDING_APPROVAL'
    draftElections: number;         // status = 'DRAFT'
    totalVotes: number;             // Count from Votes table
    totalUsers: number;             // Count from Users table
    totalAdmins: number;            // Users where role in ['ADMIN', 'SUPERADMIN']
    totalPortfolios: number;        // Count from Portfolios table
    totalCandidates: number;        // Count from Candidates table
  };
  recentActivity: Array<{
    id: string;
    action: string;
    details: string;
    timestamp: string;
    type: string;
  }>;
  upcomingElections: Election[];    // Elections with start_time > now()
  systemHealth: {
    status: "healthy" | "warning" | "error";
    uptime: string;
    activeUsers: number;
    systemLoad: number;
    databaseConnections: number;
    pendingInvitations: number;     // Count from InvitationTokens
  };
}
```

### Elections Management APIs

#### GET /api/superadmin/[superadminId]/elections

```typescript
Query Parameters: {
  page?: number;                   // Default: 1
  limit?: number;                  // Default: 10
  status?: ElectionStatus;         // Filter by status
  search?: string;                 // Search in title/description
  department?: string;             // Filter by department
  is_general?: boolean;            // Filter general vs department elections
}

Headers: {
  Authorization: "Bearer <token>"
}

Response: {
  elections: Array<Election & {
    creator: { full_name: string; email: string };
    approver?: { full_name: string; email: string };
    _count: {
      votes: number;
      candidates: number;
      portfolios: number;
    };
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

#### POST /api/superadmin/[superadminId]/elections

```typescript
Headers: {
  Authorization: "Bearer <token>"
  Content-Type: "application/json"
}

Request: {
  title: string;
  description?: string;
  start_time: string;              // ISO datetime
  end_time: string;                // ISO datetime
  is_general: boolean;
  department?: string;             // Required if is_general = false
}

Response: {
  election: Election;
  success: boolean;
}
```

#### GET /api/superadmin/[superadminId]/elections/[electionId]

```typescript
Headers: {
  Authorization: "Bearer <token>"
}

Response: {
  election: Election & {
    creator: User;
    approver?: User;
    portfolios: Array<Portfolio & {
      candidates: Candidate[];
    }>;
    adminAssignments: Array<AdminAssignment & {
      admin: User;
    }>;
  };
}
```

### Analytics APIs

#### GET /api/superadmin/[superadminId]/analytics

```typescript
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  totalElections: number;
  activeElections: number;
  completedElections: number;
  draftElections: number;
  totalVotes: number;
  totalVoters: number;
  averageTurnout: number;
  recentElections: Array<{
    election: Election;
    totalVotes: number;
    totalVoters: number;
    turnoutPercentage: number;
    portfoliosCount: number;
    candidatesCount: number;
    status: string;
  }>;
  portfolioDistribution: Array<{
    name: string;
    votes: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    votes: number;
  }>;
  voterDemographics: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
}
```

#### GET /api/superadmin/[superadminId]/analytics/[electionId]

```typescript
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  election: Election;
  totalVotes: number;
  totalVoters: number;
  turnoutPercentage: number;
  portfolios: Array<{
    id: string;
    title: string;
    candidates: Array<{
      id: string;
      name: string;
      votes: number;
      percentage: number;
      demographics?: {
        year1: number;
        year2: number;
        year3: number;
        year4: number;
      };
    }>;
  }>;
  voterDemographics: Array<{
    category: string;
    count: number;
    percentage: number;
  }>;
  hourlySummary: Array<{
    hour: string;
    votes: number;
    cumulativeVotes: number;
  }>;
}
```

### Audit Trail APIs

#### GET /api/superadmin/[superadminId]/audit-logs

```typescript
Query Parameters: {
  page?: number;
  limit?: number;
  user_id?: string;                // Filter by user
  election_id?: string;            // Filter by election
  action?: string;                 // Filter by action type
  start_date?: string;             // ISO datetime
  end_date?: string;               // ISO datetime
}

Headers: {
  Authorization: "Bearer <token>"
}

Response: {
  auditLogs: Array<AuditTrail & {
    user: { full_name: string; email: string; role: string };
    election?: { title: string };
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
```

### Department Management APIs

#### GET /api/departments

```typescript
Headers: {
  Authorization: "Bearer <token>";
}

Response: {
  departments: Array<{
    id: string;
    name: string;
    code: string;
    faculty: string;
    description?: string;
    head_of_department?: string;
    email?: string;
    phone?: string;
    building?: string;
    is_active: boolean;
  }>;
}
```

---

## 🔐 Authentication & Security

### JWT Token Structure

```typescript
interface JWTPayload {
  user_id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

### Authorization Rules

- **SuperAdmin**: Full access to all endpoints
- **Admin**: Limited access based on assigned elections
- **Approver**: Read access + approval permissions
- **Orchestrator**: System management permissions

### Security Headers Required

```typescript
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json",
  "X-Requested-With": "XMLHttpRequest"
}
```

---

## 🔄 Data Flow Patterns

### TanStack Query Integration

All API calls use TanStack Query with these patterns:

#### Query Keys Convention

```typescript
// Dashboard data
["superadmin-dashboard", superadminId][
  // Elections list
  ("superadmin-elections", superadminId, { page, status, search })
][
  // Individual election
  ("superadmin-election", superadminId, electionId)
][
  // Analytics data
  ("superadmin-analytics", superadminId)
][("election-analytics", electionId)][
  // Audit logs
  ("audit-logs", { page, user_id, election_id })
];
```

#### Error Handling Pattern

```typescript
interface APIError {
  message: string;
  status: number;
  code: string;
  details?: any;
}

// Expected error responses
{
  success: false,
  error: {
    message: "User not authorized",
    status: 403,
    code: "FORBIDDEN",
    details: { required_role: "SUPERADMIN" }
  }
}
```

#### Loading States

All components implement proper loading states using shimmer components:

- `DashboardShimmer`
- `ElectionsShimmer`
- `AnalyticsShimmer`

---

## 🧪 Testing Integration

### Mock Data Available

Located in `src/data/`:

- `elections.ts` - Sample elections with all statuses
- `admins.ts` - Sample users with different roles
- `audit-logs.ts` - Sample audit trail entries
- `departments.ts` - University departments

### API Testing Checklist

- [ ] Authentication endpoints work with JWT
- [ ] All CRUD operations for elections
- [ ] Proper error handling (400, 401, 403, 404, 500)
- [ ] Pagination works correctly
- [ ] Filtering and search functionality
- [ ] Real-time data updates for live elections
- [ ] File upload handling (if applicable)

---

## 🚀 Deployment Considerations

### Environment Variables Needed

```bash
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
```

### Performance Optimization

- Implement database indexing on frequently queried fields
- Use pagination for large datasets
- Implement caching for dashboard statistics
- Consider using WebSocket for real-time updates during live elections

### Database Migrations

Ensure all Prisma migrations are applied:

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## 📞 Integration Support

### Frontend Team Contact Points

- **Component Issues**: Check `src/components/ui/superadmin/`
- **Type Definitions**: Reference `src/types/prisma.ts`
- **API Integration**: Follow patterns in existing pages

### Common Integration Issues

1. **CORS Configuration**: Ensure backend allows frontend domain
2. **Date Formatting**: Always use ISO 8601 format
3. **UUID Generation**: Use consistent UUID format
4. **Error Responses**: Match expected error structure
5. **Authentication**: Implement proper JWT validation

---

## 🔧 Quick Start Checklist

1. [ ] Set up Prisma database connection
2. [ ] Implement authentication endpoints
3. [ ] Create dashboard API endpoint
4. [ ] Test with frontend mock data replacement
5. [ ] Implement elections CRUD operations
6. [ ] Add audit logging functionality
7. [ ] Set up proper error handling
8. [ ] Test all API endpoints with frontend
9. [ ] Implement proper authorization
10. [ ] Deploy and test in production environment

---

_This guide ensures seamless integration between the sophisticated SuperAdmin frontend and your backend implementation. All components are production-ready and follow enterprise-level coding standards._
