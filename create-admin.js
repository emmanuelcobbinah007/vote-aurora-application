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
    
    console.log('✅ SuperAdmin created successfully:');
    console.log('Email: admin@university.edu');
    console.log('Password: admin123');
    console.log('Role: SUPERADMIN');
    console.log('Please change this password after first login!');
    
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
    
    console.log('\n✅ Orchestrator created successfully:');
    console.log('Email: orchestrator@university.edu');
    console.log('Password: orchestrator123');
    console.log('Role: ORCHESTRATOR');
    
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