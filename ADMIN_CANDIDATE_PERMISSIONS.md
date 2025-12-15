# Admin Candidate Management Permissions Fix

## Problem
Admins assigned to an election were getting a **403 Forbidden** error when trying to create, update, or delete candidates. The error occurred because the frontend was hardcoded to use the superadmin API endpoints (`/api/superadmin/elections/...`), which reject requests from users with the ADMIN role.

## Solution
Implemented role-based API routing that dynamically selects the correct endpoint based on the user's role and ID:

- **ADMIN users**: `/api/admin/[adminId]/election/[electionId]/candidate`
- **SUPERADMIN users**: `/api/superadmin/elections/[electionId]/candidate`

## Files Modified

### 1. **src/services/candidateApi.ts**
Added a helper function to determine the correct API base URL based on user role:

```typescript
const getApiBaseUrl = (userRole?: string, userId?: string) => {
  if (userRole === "ADMIN" && userId) {
    return `/api/admin/${userId}/election`;
  }
  return "/api/superadmin/elections";
};
```

Updated all CRUD methods to accept and use `userRole` and `userId`:
- `getCandidates(electionId, userRole?, userId?)`
- `createCandidate(electionId, portfolioId, candidateData, userRole?, userId?)`
- `updateCandidate(electionId, candidateId, candidateData, userRole?, userId?)`
- `deleteCandidate(electionId, candidateId, userRole?, userId?)`

### 2. **src/hooks/useCandidates.ts**
Updated all hooks to accept and pass role/userId parameters:

```typescript
export const useCandidates = (electionId: string, userRole?: string, userId?: string)
export const useCreateCandidate = (electionId: string, userRole?: string, userId?: string)
export const useUpdateCandidate = (electionId: string, userRole?: string, userId?: string)
export const useDeleteCandidate = (electionId: string, userRole?: string, userId?: string)
```

### 3. **src/app/components/ui/superadmin/elections/details/CandidateManager.tsx**
- Added `useSession` import from `next-auth/react`
- Retrieved user role and ID from the session
- Passed role/userId to all candidate hooks:

```typescript
const { data: session } = useSession();
const userRole = session?.user?.role as string | undefined;
const userId = session?.user?.id as string | undefined;

const { data: candidates } = useCandidates(electionId, userRole, userId);
const createCandidateMutation = useCreateCandidate(electionId, userRole, userId);
const updateCandidateMutation = useUpdateCandidate(electionId, userRole, userId);
const deleteCandidateMutation = useDeleteCandidate(electionId, userRole, userId);
```

## Backend Verification
The admin candidate API endpoints already exist and are properly configured:

- **GET** `/api/admin/[adminId]/election/[electionId]/candidate` - List candidates
- **POST** `/api/admin/[adminId]/election/[electionId]/candidate` - Create candidate
- **PUT** `/api/admin/[adminId]/election/[electionId]/candidate/[candidateId]` - Update candidate
- **DELETE** `/api/admin/[adminId]/election/[electionId]/candidate/[candidateId]` - Delete candidate

All endpoints include:
- Role authorization (`requireRole(["ADMIN", "SUPERADMIN"])`)
- Admin-election assignment validation (`isAdminAuthorized`)
- Audit trail logging

## Testing
1. Log in as an admin user assigned to an election
2. Navigate to the election's candidate management page
3. Create, update, or delete a candidate
4. The system should now use the correct admin endpoint and succeed

## Security Notes
- Admins can only manage candidates for elections they are assigned to
- The `isAdminAuthorized` function validates the admin-election relationship
- Audit trails are created for all candidate operations
- Session data is retrieved client-side and passed through the API layer

## Next Steps
If any other components use candidate hooks directly (outside of CandidateManager), they will need similar updates to retrieve and pass session data.
