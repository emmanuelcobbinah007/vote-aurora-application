const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        status: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    console.log('Found users:', users.length);
    console.log('Users:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - Status: ${user.status}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();