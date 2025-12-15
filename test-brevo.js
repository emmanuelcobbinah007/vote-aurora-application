require('dotenv').config();

async function testBrevoKey() {
  const apiKey = process.env.BREVO_API_KEY;
  
  console.log('Testing Brevo API Key...');
  console.log('Key length:', apiKey?.length || 0);
  console.log('Key starts with:', apiKey?.substring(0, 20) || 'NOT FOUND');
  
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not found in environment');
    return;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Brevo API Error:', error);
      console.error('Status:', response.status);
      return;
    }

    const data = await response.json();
    console.log('✅ API Key is valid!');
    console.log('Account:', data.email);
    console.log('Plan:', data.plan);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBrevoKey();
