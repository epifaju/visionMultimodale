import React, { useState } from 'react';
import type { LoginCredentials } from '../../types';
import { Button, Input, Card } from '../ui';
import { useAuthStore, useUIStore } from '../../stores';

interface LoginFormProps {
  onLogin?: (credentials: LoginCredentials) => void;
  isLoading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading: propIsLoading, error: propError }) => {
  const { login, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { showSuccessMessage, showErrorMessage } = useUIStore();
  
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [validationErrors, setValidationErrors] = useState<Partial<LoginCredentials>>({});

  // Utiliser l'erreur du store ou la prop
  const error = authError || propError;
  const isLoading = authLoading || propIsLoading;

  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    
    if (!credentials.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }
    
    if (!credentials.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (credentials.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      clearError();
      
      try {
        const success = await login(credentials);
        
        if (success) {
          showSuccessMessage('Connexion réussie !');
          // Appeler le callback onLogin si fourni
          if (onLogin) {
            onLogin(credentials);
          }
        } else {
          showErrorMessage('Échec de la connexion');
        }
      } catch (error) {
        showErrorMessage('Erreur lors de la connexion');
      }
    }
  };

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur de validation quand l'utilisateur commence à taper
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 z-10">
        {/* En-tête avec logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Bienvenue
          </h2>
          <p className="mt-3 text-center text-lg text-gray-600">
            Connectez-vous à votre espace de travail
          </p>
        </div>
        
        {/* Formulaire de connexion */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur de connexion
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Champ nom d'utilisateur */}
            <div className="space-y-2">
              <Input
                label="Nom d'utilisateur"
                placeholder="Entrez votre nom d'utilisateur"
                value={credentials.username}
                onChange={(value) => handleInputChange('username', value)}
                error={validationErrors.username}
                required
              />
            </div>
            
            {/* Champ mot de passe */}
            <div className="space-y-2">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={credentials.password}
                onChange={(value) => handleInputChange('password', value)}
                error={validationErrors.password}
                required
              />
            </div>
            
            {/* Options supplémentaires */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 hover:text-gray-900 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>
            
            {/* Bouton de connexion */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connexion en cours...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Lien de création de compte */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Pas encore de compte ?{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200 hover:underline">
              Créer un compte
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
