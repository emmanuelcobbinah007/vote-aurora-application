// Quick database check script
import { prisma } from './src/libs/prisma.ts';
import crypto from 'crypto';

async function checkTestData() {
  try {
    console.log('🔍 Checking test data in database...\n');
    
    // Check voter tokens for student 22169110
    const voterTokens = await prisma.voterTokens.findMany({
      where: {
        student_id: '22169110'
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    console.log(`Found ${voterTokens.length} voter tokens for student 22169110:`);
    voterTokens.forEach((token, index) => {
      console.log(`${index + 1}. Token ID: ${token.id}`);
      console.log(`   Election: ${token.election_id}`);
      console.log(`   Status: ${token.status}`);
      console.log(`   Created: ${token.created_at}`);
      
      // Generate hash for this token
      const voterTokenHash = crypto.createHash('sha256').update(token.id).digest('hex');
      console.log(`   Hash: ${voterTokenHash.substring(0, 8)}...`);
      console.log('');
    });

    // Check for votes using these hashes
    for (const token of voterTokens) {
      const voterTokenHash = crypto.createHash('sha256').update(token.id).digest('hex');
      const votes = await prisma.votes.findMany({
        where: {
          voter_token_hash: voterTokenHash,
          election_id: token.election_id
        }
      });

      if (votes.length > 0) {
        console.log(`📊 Found ${votes.length} votes for token ${token.id}:`);
        votes.forEach((vote, index) => {
          console.log(`   Vote ${index + 1}: Portfolio ${vote.portfolio_id}, Candidate ${vote.candidate_id}`);
          console.log(`   Cast at: ${vote.cast_at}`);
        });
        console.log('');
      }
    }

  } catch (error) {
    console.error('❌ Error checking test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTestData();