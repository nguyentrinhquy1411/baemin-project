'use client';

import { useAuth } from '@/contexts/auth-context';

export default function DebugUser() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>User Debug Information</h1>
      <div>
        <h3>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</h3>
        <h3>User Data:</h3>
        <pre>{JSON.stringify(user, null, 2)}</pre>
      </div>
    </div>
  );
}
