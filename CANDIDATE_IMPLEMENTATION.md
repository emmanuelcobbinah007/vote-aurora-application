# Candidate Management Implementation

## Summary

I've successfully implemented a comprehensive candidate management system for elections, following the same pattern as the portfolio management. This includes backend API routes, frontend integration, and enhanced user experience features.

## 🚀 Backend API Routes

### 1. Candidate Collection Route (`/api/superadmin/elections/[electionId]/candidate/route.ts`)

**GET** - Fetch all candidates for an election

- Returns candidates with portfolio relationship data
- Validates election exists
- Orders by creation date
- Includes portfolio title for easy reference

**POST** - Create new candidate

- Validates required fields (portfolio_id, full_name)
- Prevents duplicate candidate names within same portfolio
- Validates portfolio exists and belongs to election
- Checks election status (can't add to live/closed elections)
- Returns created candidate with portfolio data

### 2. Individual Candidate Route (`/api/superadmin/elections/[electionId]/candidate/[candidateId]/route.ts`)

**PUT** - Update candidate

- Validates candidate exists and belongs to election
- Prevents duplicate names within same portfolio
- Checks election status restrictions
- Returns updated candidate with portfolio data

**DELETE** - Delete candidate

- Validates candidate exists
- Prevents deletion if candidate has received votes
- Checks election status restrictions
- Protects data integrity with vote count validation

## 🎨 Frontend Components

### 1. Updated CandidateManager (`CandidateManager.tsx`)

- **Real API Integration**: Replaced mock data with actual API calls
- **Loading States**: Skeleton loaders during data fetching with realistic candidate card layouts
- **Toast Notifications**: Success/error messages using react-toastify
- **Vote Count Display**: Shows number of votes received per candidate (if available)
- **Refresh Functionality**: Manual refresh button with loading animation
- **Enhanced Error Handling**: Specific error messages for different scenarios
- **Smart Delete Protection**: Warns users about candidates with votes
- **Portfolio Filtering**: Filter candidates by portfolio with "All Portfolios" option
- **Grouped Display**: Candidates organized by portfolio with separate sections

### 2. Enhanced CreateCandidateModal (`CreateCandidateModal.tsx`)

- **Improved Error Handling**: Field-specific error messages for validation failures
- **Portfolio Selection**: Dropdown for portfolio selection with preselection support
- **Image Upload Integration**: Support for candidate photo uploads
- **Modal Persistence**: Keeps modal open on error for correction
- **Edit Mode Support**: Handles both create and edit operations

### 3. Candidate API Service (`/services/candidateApi.ts`)

- **Type Safety**: Full TypeScript interfaces matching backend responses
- **Error Handling**: Proper error propagation with meaningful messages
- **Clean API**: Consistent request/response handling
- **Reusable Service**: Can be used across different components

## 🛡️ Data Validation & Security

### Database Level

- **Unique Constraints**: Prevents duplicate candidate names per portfolio
- **Foreign Key Validation**: Ensures election and portfolio exist
- **Vote Protection**: Cannot delete candidates with votes
- **Status Checks**: Protects live/closed elections from modifications

### API Level

- **Input Sanitization**: Trims whitespace, validates required fields
- **Relationship Validation**: Ensures candidates belong to correct elections and portfolios
- **Status Validation**: Comprehensive election status checks
- **Business Logic Protection**: Prevents deletion of candidates with votes

### Frontend Level

- **Form Validation**: Yup schema validation with real-time feedback
- **Portfolio Validation**: Ensures valid portfolio selection
- **Duplicate Prevention**: Server-side validation with user-friendly messages
- **Error Recovery**: Clear error messages with actionable feedback

## 🎯 User Experience Features

### Visual Feedback

- ✅ **Success Toasts**: "Candidate added successfully!"
- ❌ **Error Toasts**: Specific error messages
- **Warning Toasts**: For protected actions (candidates with votes)
- 🔄 **Loading States**: Realistic skeleton loaders for candidate cards
- 📊 **Vote Counts**: Visual indication of candidate performance
- 👤 **Photo Display**: Candidate photos with fallback avatars

### Smart Interactions

- **Auto-refresh**: Loads candidates on component mount
- **Manual Refresh**: Button with loading animation
- **Portfolio Filtering**: Easy filtering by portfolio or view all
- **Grouped Display**: Candidates organized by portfolio sections
- **Confirmation Dialogs**: For destructive actions
- **Modal Persistence**: Stays open on validation errors
- **Preselection Support**: Can preselect portfolio when adding candidates

### Error Handling

- **Network Errors**: Graceful handling of API failures
- **Validation Errors**: Field-specific error messages
- **Business Logic Errors**: Clear explanations of restrictions
- **Vote Protection**: Special handling for candidates with votes
- **Portfolio Validation**: Ensures valid portfolio relationships

## 🔧 Technical Implementation

### API Response Format

```typescript
// GET /api/.../candidate
{
  candidates: Candidate[]
}

// POST /api/.../candidate
{
  message: "Candidate created successfully",
  candidate: Candidate
}

// Error Response
{
  error: "Specific error message"
}
```

### Candidate Data Structure

```typescript
interface Candidate {
  id: string;
  full_name: string;
  photo_url?: string;
  manifesto?: string;
  portfolio_id: string;
  election_id: string;
  created_at: string;
  portfolio?: {
    id: string;
    title: string;
  };
  _count?: {
    votes: number;
  };
}
```

### Error Scenarios Handled

1. **Duplicate Names**: "A candidate with this name already exists in this portfolio"
2. **Election Not Found**: "Election not found"
3. **Portfolio Not Found**: "Portfolio not found or does not belong to this election"
4. **Protected Elections**: "Cannot modify candidates in an election that is live, closed, or archived"
5. **Candidates with Votes**: "Cannot delete candidate that has received votes. Please archive the election instead."
6. **Missing Required Fields**: "Candidate name is required" / "Portfolio is required"

## 🎨 Theme Integration

All components follow the established `#cc910d` (golden/amber) theme:

- Primary buttons use theme color
- Icons and accents match theme
- Loading states maintain theme consistency
- Error states use appropriate red colors
- Success states use complementary green colors
- Portfolio sections have consistent styling

## 📊 Enhanced Features

### Portfolio Integration

- **Grouped Display**: Candidates organized by portfolio
- **Portfolio Headers**: Clear section headers with candidate counts
- **Quick Add**: Add candidates to specific portfolios directly
- **Portfolio Filtering**: Filter view by specific portfolio

### Data Display

- **Candidate Cards**: Professional card layout with photos
- **Vote Tracking**: Display vote counts when available
- **Manifesto Preview**: Truncated manifesto text with line clamps
- **Creation Dates**: Formatted date display
- **Portfolio Labels**: Clear portfolio assignment indicators

### User Actions

- **Bulk Operations**: Portfolio-specific add candidate buttons
- **Individual Actions**: Edit/delete per candidate
- **Smart Validation**: Context-aware error handling
- **Protected Actions**: Vote-based delete protection

## 🧪 Testing Recommendations

To test the implementation:

1. **Create Candidate**: Try creating candidates in different portfolios
2. **Duplicate Detection**: Attempt to create duplicate candidate names in same portfolio
3. **Cross-Portfolio**: Create candidates with same name in different portfolios (should work)
4. **Edit Candidate**: Modify existing candidate details
5. **Delete Protection**: Try deleting candidates with/without votes
6. **Portfolio Filtering**: Test filtering by different portfolios
7. **Election Status**: Test with different election statuses
8. **Image Upload**: Test candidate photo upload functionality
9. **Network Errors**: Test with API disconnection
10. **Loading States**: Observe UI during API calls

## 🔄 Integration with Portfolio System

The candidate management system seamlessly integrates with the portfolio system:

- **Dependency Validation**: Cannot add candidates without portfolios
- **Relationship Integrity**: Maintains proper candidate-portfolio relationships
- **Consistent UX**: Same interaction patterns and visual design
- **Error Coordination**: Coordinated error handling across both systems

The implementation is production-ready with comprehensive error handling, user feedback, data validation, and seamless integration with the existing portfolio management system! 🎉

## 🚀 Next Steps

The candidate management system is now complete and ready for integration with:

1. **Election Details Page**: Include candidate management alongside portfolio management
2. **Voting System**: Integration with ballot generation and voting processes
3. **Results Analytics**: Connection to election results and analytics
4. **Bulk Operations**: Future enhancements for bulk candidate import/export
