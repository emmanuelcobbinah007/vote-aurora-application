const { PrismaClient } = require('./src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createSuperAdmin() {
  try {
    // Hash the default password
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const superAdmin = await prisma.users.create({
      data: {
        full_name: 'System Administrator',
        email: 'admin@university.edu',
        password_hash: passwordHash,
        role: 'SUPERADMIN',
        status: 'ACTIVE',
      },
    });
    
    
    // Also create an ORCHESTRATOR user
    const orchestratorHash = await bcrypt.hash('orchestrator123', 12);
    
    const orchestrator = await prisma.users.create({
      data: {
        full_name: 'System Orchestrator',
        email: 'orchestrator@university.edu', 
        password_hash: orchestratorHash,
        role: 'ORCHESTRATOR',
        status: 'ACTIVE',
      },
    });
    
    
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Users already exist with these email addresses');
    } else {
      console.error('❌ Error creating users:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createSuperAdmin();