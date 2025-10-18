// Clear test votes for development
const { PrismaClient } = require('./src/generated/prisma');
const crypto = require('crypto');

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function clearTestVotes() {
  try {
    console.log('🧹 Clearing test votes for student 22169110...\n');
    
    // Get all voter tokens for this student
    const voterTokens = await prisma.voterTokens.findMany({
      where: {
        student_id: '22169110'
      }
    });

    console.log(`Found ${voterTokens.length} voter tokens`);

    let totalVotesDeleted = 0;
    
    for (const token of voterTokens) {
      const voterTokenHash = crypto.createHash('sha256').update(token.id).digest('hex');
      
      // Check for existing votes
      const existingVotes = await prisma.votes.findMany({
        where: {
          voter_token_hash: voterTokenHash
        }
      });

      if (existingVotes.length > 0) {
        console.log(`Found ${existingVotes.length} votes for token ${token.id}`);
        
        // Delete votes
        const deleteResult = await prisma.votes.deleteMany({
          where: {
            voter_token_hash: voterTokenHash
          }
        });

        console.log(`Deleted ${deleteResult.count} votes`);
        totalVotesDeleted += deleteResult.count;
      }
    }

    console.log(`\n✅ Total votes deleted: ${totalVotesDeleted}`);

  } catch (error) {
    console.error('❌ Error clearing test votes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestVotes();