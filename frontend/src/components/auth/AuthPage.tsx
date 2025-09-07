import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import type { LoginCredentials, RegisterCredentials } from '../../types';

export type AuthMode = 'login' | 'register';

interface AuthPageProps {
  initialMode?: AuthMode;
  onLogin?: (credentials: LoginCredentials) => void;
  onRegister?: (credentials: RegisterCredentials) => void;
  onModeChange?: (mode: AuthMode) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ 
  initialMode = 'login',
  onLogin,
  onRegister,
  onModeChange
}) => {
  const [currentMode, setCurrentMode] = useState<AuthMode>(initialMode);

  const handleSwitchToRegister = () => {
    setCurrentMode('register');
    onModeChange?.('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentMode('login');
    onModeChange?.('login');
  };

  const handleLogin = (credentials: LoginCredentials) => {
    onLogin?.(credentials);
  };

  const handleRegister = (credentials: RegisterCredentials) => {
    onRegister?.(credentials);
  };

  if (currentMode === 'register') {
    return (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={handleSwitchToLogin}
      />
    );
  }

  return (
    <LoginForm
      onLogin={handleLogin}
      onSwitchToRegister={handleSwitchToRegister}
    />
  );
};

export default AuthPage;


