require('dotenv').config();

async function testBrevoSendEmail() {
  const apiKey = process.env.BREVO_API_KEY;
  
  console.log('Testing Brevo Email Send...');
  console.log('API Key:', apiKey?.substring(0, 30) + '...' + apiKey?.substring(apiKey.length - 10));
  
  if (!apiKey) {
    console.error('❌ BREVO_API_KEY not found');
    return;
  }

  const emailData = {
    sender: {
      name: "VoteAurora Test",
      email: "noreply@aurorasoftwarelabs.io",
    },
    to: [{ email: "aurorasoftwarelabs@gmail.com" }],
    subject: "Test Email from Brevo API",
    htmlContent: "<html><body><h1>Test Email</h1><p>If you receive this, the Brevo API key is working!</p></body></html>",
  };

  try {
    console.log('\nSending test email...');
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();
    console.log('\nResponse Status:', response.status);
    console.log('Response:', responseText);

    if (!response.ok) {
      console.error('\n❌ Failed to send email');
      try {
        const errorData = JSON.parse(responseText);
        console.error('Error details:', errorData);
      } catch (e) {
        console.error('Raw error:', responseText);
      }
      return;
    }

    const data = JSON.parse(responseText);
    console.log('\n✅ Email sent successfully!');
    console.log('Message ID:', data.messageId);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testBrevoSendEmail();
