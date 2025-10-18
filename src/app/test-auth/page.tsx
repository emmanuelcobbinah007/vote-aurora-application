"use client";
import React, { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';

export default function TestAuth() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('Test123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      console.log('Attempting login with:', { email, password });
      const response = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      console.log('Auth response:', response);
      setResult(response);
      
      // If login was successful, log the event
      if (response?.ok) {
        const session = await getSession();
        if (session?.user) {
          try {
            const auditResponse = await fetch('/api/audit-trail', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: "USER_LOGIN",
                metadata: {
                  entityType: "USER",
                  userId: session.user.id,
                  user_name: session.user.name,
                  user_email: session.user.email,
                  user_role: session.user.role
                }
              })
            });
            
            const auditResult = await auditResponse.json();
            console.log('Audit log result:', auditResult);
            
            if (auditResult.success) {
              setResult({
                ...response,
                auditLog: 'Success! Login event recorded in audit trail'
              });
            }
          } catch (auditError) {
            console.error('Error recording audit log:', auditError);
            setResult({
              ...response,
              auditLog: 'Warning: Login successful but audit log failed'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      setResult({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <form onSubmit={handleLogin} className="mb-6 bg-white p-6 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {loading ? 'Logging in...' : 'Test Login'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Result:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}