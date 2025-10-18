const { PrismaClient } = require('.prisma/university');

async function testUniversityDatabase() {
  console.log('🔍 Testing University Database Connection...');
  console.log('URL:', process.env.UNIVERSITY_DATABASE_URL?.replace(/:[^:]*@/, ':****@'));
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('\n1. Testing basic connection...');
    await prisma.$connect();
    console.log('✅ Basic connection successful!');

    console.log('\n2. Testing raw query...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Raw query successful:', result);

    console.log('\n3. Checking if departments table exists...');
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'departments'
      ) as exists;
    `;
    console.log('✅ Departments table check:', tableExists);

    console.log('\n4. Testing departments count...');
    const count = await prisma.departments.count();
    console.log(`✅ Found ${count} departments in database`);

    if (count > 0) {
      console.log('\n5. Fetching sample departments...');
      const departments = await prisma.departments.findMany({ 
        take: 3,
        select: {
          id: true,
          name: true
        }
      });
      console.log('✅ Sample departments:', departments);
    } else {
      console.log('\n   No departments found in database');
    }

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error('Error name:', error.name);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error('🔴 DNS resolution failed - hostname not found');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔴 Connection refused - database server not responding');
    } else if (error.message.includes('ETIMEDOUT')) {
      console.error('🔴 Connection timeout - database server unreachable');
    } else if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('🔴 Authentication failed - check username/password');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.error('🔴 Database does not exist');
    } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.error('🔴 Table "departments" does not exist');
    }
    
    console.error('\nFull error details:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Load environment variables
require('dotenv').config();

testUniversityDatabase();