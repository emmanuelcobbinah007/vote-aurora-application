// Development script to clear test votes
// Usage: node clear-test-votes.js <student_id> <election_id>

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function clearTestVotes(studentId, electionId) {
  try {
    console.log(`Clearing votes for student ${studentId} in election ${electionId}...`);
    
    // First, find the voter token for this student and election
    const voterToken = await prisma.voterTokens.findFirst({
      where: {
        student_id: studentId,
        election_id: electionId
      }
    });

    if (!voterToken) {
      console.log(`No voter token found for student ${studentId} in election ${electionId}`);
      return;
    }

    // Generate the same hash used in the API
    const crypto = require('crypto');
    const voterTokenHash = crypto.createHash('sha256').update(voterToken.id).digest('hex');
    
    // Find existing votes
    const existingVotes = await prisma.votes.findMany({
      where: {
        voter_token_hash: voterTokenHash,
        election_id: electionId
      }
    });

    console.log(`Found ${existingVotes.length} existing votes`);

    if (existingVotes.length > 0) {
      // Delete the votes
      const deleteResult = await prisma.votes.deleteMany({
        where: {
          voter_token_hash: voterTokenHash,
          election_id: electionId
        }
      });

      console.log(`Deleted ${deleteResult.count} votes`);
    } else {
      console.log('No votes found to delete');
    }

  } catch (error) {
    console.error('Error clearing test votes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get command line arguments
const studentId = process.argv[2];
const electionId = process.argv[3];

if (!studentId || !electionId) {
  console.log('Usage: node clear-test-votes.js <student_id> <election_id>');
  console.log('Example: node clear-test-votes.js 22169110 some-election-id');
  process.exit(1);
}

clearTestVotes(studentId, electionId);