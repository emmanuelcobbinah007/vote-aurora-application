# Admin Analytics Implementation

## Overview

The admin analytics page has been completely redesigned to show appropriate information based on the election lifecycle status. This prevents inappropriate data display like showing winners before elections end.

## Status-Based Analytics Views

### 1. DRAFT Election Analytics

**When to show**: Election is being prepared but hasn't started yet.

**What's displayed**:

- Election setup progress
- Readiness checklist (portfolios, candidates, voters registered)
- Portfolio and candidate configuration overview
- Pre-election preparation status
- Estimated voter turnout projections

**What's NOT shown**:

- Vote counts
- Winners or results
- Real-time voting data

### 2. LIVE Election Analytics

**When to show**: Election is currently active and voting is in progress.

**What's displayed**:

- Real-time voter turnout percentage
- Voting activity trends (hourly participation)
- Portfolio participation rates (without revealing winners)
- Total votes cast vs. eligible voters
- Voting pace and projections

**What's NOT shown**:

- Individual candidate vote counts
- Winners or leading candidates
- Final results
- Detailed vote breakdowns that could influence ongoing voting

### 3. CLOSED Election Analytics

**When to show**: Election has ended and results can be revealed.

**What's displayed**:

- Complete election results
- Winner announcements for each portfolio
- Detailed candidate performance
- Final voter turnout statistics
- Vote distribution analysis
- Demographic breakdowns
- Historical comparison data

## API Implementation

### Endpoint: `/api/admin/[adminId]/analytics`

The API dynamically returns different data structures based on election status:

```typescript
// DRAFT status response
{
  election: { /* basic info */ },
  portfoliosCount: number,
  candidatesCount: number,
  totalVoters: number,
  readinessChecks: {
    portfoliosSetup: boolean,
    candidatesRegistered: boolean,
    votersRegistered: boolean,
    ballotConfigured: boolean
  }
}

// LIVE status response
{
  election: { /* basic info */ },
  totalVotes: number,
  turnoutPercentage: number,
  votingTrends: Array<{time: string, votes: number}>,
  portfolioParticipation: Array<{name: string, votes: number}>,
  hourlyActivity: Array</* hourly stats */>
}

// CLOSED status response
{
  election: { /* basic info */ },
  totalVotes: number,
  turnoutPercentage: number,
  portfolioResults: Array<{
    name: string,
    votes: number,
    percentage: number,
    winner: {name: string, votes: number}
  }>,
  candidateResults: Array<{
    name: string,
    portfolio: string,
    votes: number,
    percentage: number,
    isWinner: boolean
  }>,
  voterDemographics: Array</* demographic data */>
}
```

## Component Structure

### Main Component: `AdminAnalyticsPage`

- Fetches admin's assigned election
- Determines election status
- Renders appropriate view component

### Status-Specific Components:

1. `DraftElectionView` - Setup and readiness information
2. `LiveElectionView` - Real-time participation data
3. `ClosedElectionView` - Complete results and analysis

## Security & Ethics Considerations

1. **No Premature Results**: Winners and vote counts are only shown after election closure
2. **Real-time Monitoring**: Live elections show participation without influencing ongoing votes
3. **Admin-Specific Data**: Each admin only sees data for their assigned election
4. **Appropriate Permissions**: Different data exposure based on election lifecycle stage

## Benefits

1. **Prevents Vote Influence**: No premature winner announcements
2. **Appropriate Information**: Each status shows relevant data only
3. **Better UX**: Clear, status-appropriate interfaces
4. **Ethical Voting**: Maintains election integrity throughout the process
5. **Admin Efficiency**: Relevant information for each election phase

## Files Modified

- `/src/app/admin/[adminId]/analytics/page.tsx` - Complete rewrite
- `/src/app/api/admin/[adminId]/analytics/route.ts` - Status-based API logic
- Added proper TypeScript interfaces for each status response
- Enhanced error handling and loading states

## Usage

Admins can access analytics through the sidebar navigation. The page automatically adapts to show appropriate information based on their election's current status, ensuring ethical and appropriate data display throughout the election lifecycle.
