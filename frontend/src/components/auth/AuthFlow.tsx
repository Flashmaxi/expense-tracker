import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SetupPassword from '../../pages/SetupPassword';
import LoginPassword from '../../pages/LoginPassword';

const AuthFlow: React.FC = () => {
  const { checkSetup } = useAuth();
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuthFlow = async () => {
      try {
        const passwordExists = await checkSetup();
        setHasPassword(passwordExists);
      } catch (error) {
        console.error('Failed to check setup status:', error);
        setHasPassword(false); // Default to setup if check fails
      } finally {
        setLoading(false);
      }
    };

    initAuthFlow();
  }, [checkSetup]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your expense tracker...</p>
        </div>
      </div>
    );
  }

  // If no password is set, show setup page
  if (hasPassword === false) {
    return <SetupPassword />;
  }

  // If password is set, show login page
  return <LoginPassword />;
};

export default AuthFlow;