# SuperAdmin Component Architecture Guide

This document explains the component architecture, data flow patterns, and TanStack Query implementation across the SuperAdmin section of the University E-Voting System.

## Overview

The SuperAdmin frontend is built with:

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TanStack Query** for server state management
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Lucide React** for icons

## Project Structure

```
src/
├── app/
│   ├── superadmin/
│   │   ├── [superadminId]/
│   │   │   ├── dashboard/page.tsx          # Dashboard overview
│   │   │   ├── elections/
│   │   │   │   ├── page.tsx                # Elections list
│   │   │   │   └── [electionId]/page.tsx   # Individual election
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx                # Analytics overview
│   │   │   │   └── [electionId]/page.tsx   # Election analytics
│   │   │   ├── subadmins/page.tsx          # Admin management
│   │   │   ├── approvals/page.tsx          # Election approvals
│   │   │   ├── audit-logs/page.tsx         # Audit trail
│   │   │   └── settings/page.tsx           # System settings
│   │   ├── layout.tsx                      # SuperAdmin layout
│   │   └── page.tsx                        # SuperAdmin entry point
│   └── components/
│       └── ui/
│           └── superadmin/
│               ├── dashboard/               # Dashboard components
│               ├── analytics/               # Analytics components
│               └── shared/                  # Shared components
├── data/                                    # Mock data & types
├── types/                                   # TypeScript definitions
└── libs/                                    # Utility functions
```

## Component Architecture Patterns

### 1. Page-Level Components (Route Handlers)

**Pattern**: Each route is a page component that handles:

- URL parameter extraction
- TanStack Query data fetching
- Loading states with shimmer components
- Error boundaries
- Data passing to container components

**Example**: `dashboard/page.tsx`

```tsx
"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import DashboardContainer from "@/components/ui/superadmin/dashboard/DashboardContainer";
import DashboardShimmer from "@/components/ui/superadmin/dashboard/DashboardShimmer";

const fetchDashboardData = async (superadminId: string) => {
  // API call simulation
  const response = await fetch(`/api/superadmin/dashboard`);
  if (!response.ok) throw new Error("Failed to fetch dashboard data");
  return response.json();
};

export default function DashboardPage() {
  const { superadminId } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", superadminId],
    queryFn: () => fetchDashboardData(superadminId as string),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <DashboardShimmer />;
  if (error) return <ErrorDisplay error={error} />;

  return <DashboardContainer dashboardData={data} />;
}
```

### 2. Container Components

**Pattern**: Container components receive data as props and orchestrate multiple sub-components:

- Accept typed data props
- Handle local state for UI interactions
- Coordinate between multiple child components
- Implement business logic and event handlers

**Example**: `DashboardContainer.tsx`

```tsx
interface DashboardContainerProps {
  dashboardData: DashboardResponse;
}

export default function DashboardContainer({
  dashboardData,
}: DashboardContainerProps) {
  return (
    <div className="space-y-6">
      <DashboardSummaryCards overview={dashboardData.overview} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions superadminId={dashboardData.superadminId} />
        <RecentActivity activities={dashboardData.recentActivity} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingElections elections={dashboardData.upcomingElections} />
        <SystemHealth health={dashboardData.systemHealth} />
      </div>
    </div>
  );
}
```

### 3. Specialized Components

**Pattern**: Small, focused components that handle specific UI sections:

- Single responsibility principle
- Receive minimal, specific props
- Pure components when possible
- Consistent styling with theme colors

**Example**: `DashboardSummaryCards.tsx`

```tsx
interface SummaryCardsProps {
  overview: {
    totalElections: number;
    activeElections: number;
    completedElections: number;
    // ... other fields
  };
}

export default function DashboardSummaryCards({ overview }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        title="Total Elections"
        value={overview.totalElections}
        icon={<Vote className="h-5 w-5 text-amber-600" />}
        trend="+12%"
      />
      {/* More cards... */}
    </div>
  );
}
```

### 4. Shimmer/Loading Components

**Pattern**: Loading state components that match the layout structure:

- Mirror the actual component layout
- Use skeleton animations
- Consistent with design system
- Same responsive behavior as real components

**Example**: `DashboardShimmer.tsx`

```tsx
export default function DashboardShimmer() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Summary Cards Shimmer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>

      {/* Content Sections Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-200 rounded-lg h-64"></div>
        <div className="bg-gray-200 rounded-lg h-64"></div>
      </div>
    </div>
  );
}
```

## Data Flow Architecture

### 1. TanStack Query Implementation

**Query Keys Structure**:

```typescript
// Hierarchical query keys for efficient caching
const queryKeys = {
  dashboard: (superadminId: string) => ["dashboard", superadminId],
  elections: (superadminId: string, filters?: any) => [
    "elections",
    superadminId,
    filters,
  ],
  election: (electionId: string) => ["election", electionId],
  analytics: (superadminId: string) => ["analytics", superadminId],
  electionAnalytics: (electionId: string) => ["analytics", electionId],
  admins: (superadminId: string, filters?: any) => [
    "admins",
    superadminId,
    filters,
  ],
  auditLogs: (superadminId: string, filters?: any) => [
    "auditLogs",
    superadminId,
    filters,
  ],
};
```

**Query Configuration Standards**:

```typescript
const commonQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false, // Prevent excessive refetching
  retry: 3, // Retry failed requests 3 times
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
};
```

### 2. Data Fetching Patterns

**Fetch Functions**:

```typescript
// src/libs/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export const fetchDashboardData = async (
  superadminId: string
): Promise<DashboardResponse> => {
  const response = await fetch(`${API_BASE}/superadmin/dashboard`, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Dashboard fetch failed: ${response.status}`);
  }

  return response.json();
};

export const fetchElections = async (
  superadminId: string,
  filters?: ElectionFilters
): Promise<ElectionsListResponse> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);

  const response = await fetch(`${API_BASE}/superadmin/elections?${params}`);
  if (!response.ok) throw new Error("Elections fetch failed");
  return response.json();
};
```

### 3. Error Handling Strategy

**Error Boundary Implementation**:

```tsx
// components/ui/shared/ErrorBoundary.tsx
interface ErrorDisplayProps {
  error: Error;
  retry?: () => void;
}

export function ErrorDisplay({ error, retry }: ErrorDisplayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-600 mb-4 text-center max-w-md">
        {error.message || "An unexpected error occurred"}
      </p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try again
        </Button>
      )}
    </div>
  );
}
```

## Theme and Styling Standards

### Color System

**Primary Colors** (Amber-based):

```css
--primary: #d97706; /* amber-600 */
--primary-foreground: #451a03; /* amber-950 */
--primary-light: #f59e0b; /* amber-500 */
--primary-dark: #92400e; /* amber-700 */
```

**Secondary Colors** (Gray-based):

```css
--secondary: #4b5563; /* gray-600 */
--secondary-foreground: #f9fafb; /* gray-50 */
--muted: #6b7280; /* gray-500 */
--muted-foreground: #374151; /* gray-700 */
```

**Status Colors**:

```css
--success: #10b981; /* emerald-500 */
--warning: #f59e0b; /* amber-500 */
--error: #ef4444; /* red-500 */
--info: #3b82f6; /* blue-500 */
```

### Component Styling Patterns

**Card Components**:

```css
.card-base {
  @apply bg-white rounded-lg border border-gray-200 shadow-sm;
}

.card-header {
  @apply px-6 py-4 border-b border-gray-200;
}

.card-content {
  @apply px-6 py-4;
}
```

**Button Variants**:

```css
.btn-primary {
  @apply bg-amber-600 hover:bg-amber-700 text-white;
}

.btn-secondary {
  @apply bg-gray-600 hover:bg-gray-700 text-white;
}

.btn-outline {
  @apply border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white;
}
```

## State Management Patterns

### 1. Server State (TanStack Query)

**Used for**:

- API data fetching
- Caching responses
- Background updates
- Optimistic updates for mutations

**Example**:

```typescript
const {
  data: elections,
  isLoading,
  error,
} = useQuery({
  queryKey: ["elections", superadminId, filters],
  queryFn: () => fetchElections(superadminId, filters),
  keepPreviousData: true, // For pagination
});
```

### 2. Client State (React useState/useReducer)

**Used for**:

- Form data
- UI state (modals, dropdowns)
- Local filters and sorting
- Temporary user interactions

**Example**:

```typescript
const [filters, setFilters] = useState<ElectionFilters>({
  status: undefined,
  search: "",
});

const [selectedElections, setSelectedElections] = useState<string[]>([]);
```

### 3. URL State (Next.js router)

**Used for**:

- Pagination parameters
- Filter state that should persist on refresh
- Deep-linkable application state

**Example**:

```typescript
const router = useRouter();
const searchParams = useSearchParams();

const currentPage = parseInt(searchParams.get("page") || "1");
const statusFilter = searchParams.get("status") as ElectionStatus;

const updateFilters = (newFilters: ElectionFilters) => {
  const params = new URLSearchParams(searchParams);
  if (newFilters.status) params.set("status", newFilters.status);
  else params.delete("status");

  router.push(`?${params.toString()}`);
};
```

## Performance Optimization Strategies

### 1. Code Splitting

**Route-based splitting**:

```typescript
// Automatic with Next.js App Router
const DashboardPage = lazy(() => import("./dashboard/page"));
const ElectionsPage = lazy(() => import("./elections/page"));
```

**Component-based splitting**:

```typescript
const AnalyticsChart = lazy(() => import("./AnalyticsChart"));

// Usage with Suspense
<Suspense fallback={<ChartShimmer />}>
  <AnalyticsChart data={chartData} />
</Suspense>;
```

### 2. Memoization

**Component memoization**:

```typescript
const DashboardSummaryCard = memo(
  ({ title, value, icon }: SummaryCardProps) => {
    return <Card>{/* Card content */}</Card>;
  }
);
```

**Value memoization**:

```typescript
const processedData = useMemo(() => {
  return elections.map((election) => ({
    ...election,
    formattedDate: formatDate(election.start_time),
    statusColor: getStatusColor(election.status),
  }));
}, [elections]);
```

### 3. Query Optimization

**Prefetching**:

```typescript
useEffect(() => {
  // Prefetch likely next pages
  queryClient.prefetchQuery({
    queryKey: ["elections", superadminId, { page: currentPage + 1 }],
    queryFn: () => fetchElections(superadminId, { page: currentPage + 1 }),
  });
}, [currentPage, superadminId]);
```

**Background refetching**:

```typescript
const { data } = useQuery({
  queryKey: ["dashboard", superadminId],
  queryFn: () => fetchDashboardData(superadminId),
  refetchInterval: 30000, // Refetch every 30 seconds
  refetchIntervalInBackground: true,
});
```

## Testing Architecture

### 1. Component Testing

**Testing utilities setup**:

```typescript
// test-utils.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithQuery = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
};
```

**Component test example**:

```typescript
// DashboardSummaryCards.test.tsx
import { renderWithQuery } from "../test-utils";
import DashboardSummaryCards from "./DashboardSummaryCards";

const mockOverview = {
  totalElections: 12,
  activeElections: 3,
  // ... other properties
};

test("renders summary cards with correct data", () => {
  const { getByText } = renderWithQuery(
    <DashboardSummaryCards overview={mockOverview} />
  );

  expect(getByText("12")).toBeInTheDocument();
  expect(getByText("Total Elections")).toBeInTheDocument();
});
```

### 2. Integration Testing

**API integration tests**:

```typescript
// api.test.ts
import { fetchDashboardData } from "../libs/api";

test("fetchDashboardData returns correct structure", async () => {
  const mockResponse = {
    superadminId: "test-id",
    overview: {
      /* mock data */
    },
    // ... other properties
  };

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })
  );

  const result = await fetchDashboardData("test-id");
  expect(result).toEqual(mockResponse);
});
```

## Security Considerations

### 1. Authentication

**JWT Token handling**:

```typescript
// libs/auth.ts
export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};
```

**Protected route wrapper**:

```typescript
// components/ProtectedRoute.tsx
export function ProtectedRoute({
  children,
  requiredRole = "ADMIN",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!user || !hasRequiredRole(user.role, requiredRole)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

### 2. Data Validation

**Runtime type checking**:

```typescript
import { z } from "zod";

const DashboardResponseSchema = z.object({
  superadminId: z.string().uuid(),
  overview: z.object({
    totalElections: z.number().min(0),
    activeElections: z.number().min(0),
    // ... other validations
  }),
  // ... other schema definitions
});

export const validateDashboardResponse = (data: unknown): DashboardResponse => {
  return DashboardResponseSchema.parse(data);
};
```

This architecture guide provides a comprehensive overview of how the SuperAdmin frontend is structured and implemented, making it easier for developers to understand, maintain, and extend the system.
