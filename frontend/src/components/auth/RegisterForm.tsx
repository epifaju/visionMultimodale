import React, { useState } from 'react';
import type { RegisterCredentials } from '../../types';
import { Button, Input } from '../ui';
import { useAuthStore, useUIStore } from '../../stores';

interface RegisterFormProps {
  onRegister?: (credentials: RegisterCredentials) => void;
  onSwitchToLogin?: () => void;
  isLoading?: boolean;
  error?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onRegister, 
  onSwitchToLogin, 
  isLoading: propIsLoading, 
  error: propError 
}) => {
  const { register, isLoading: authLoading, error: authError, clearError } = useAuthStore();
  const { showSuccessMessage, showErrorMessage } = useUIStore();
  
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationErrors, setValidationErrors] = useState<Partial<RegisterCredentials & { confirmPassword: string }>>({});

  // Utiliser l'erreur du store ou la prop
  const error = authError || propError;
  const isLoading = authLoading || propIsLoading;

  const validateForm = (): boolean => {
    const errors: Partial<RegisterCredentials & { confirmPassword: string }> = {};
    
    // Validation du nom d'utilisateur
    if (!credentials.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    } else if (credentials.username.length < 3) {
      errors.username = 'Le nom d\'utilisateur doit contenir au moins 3 caractères';
    } else if (credentials.username.length > 50) {
      errors.username = 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(credentials.username)) {
      errors.username = 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores';
    }

    // Validation de l'email
    if (!credentials.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    // Validation du prénom
    if (!credentials.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    } else if (credentials.firstName.length > 50) {
      errors.firstName = 'Le prénom ne peut pas dépasser 50 caractères';
    }

    // Validation du nom
    if (!credentials.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    } else if (credentials.lastName.length > 50) {
      errors.lastName = 'Le nom ne peut pas dépasser 50 caractères';
    }

    // Validation du mot de passe
    if (!credentials.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (credentials.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (credentials.password.length > 128) {
      errors.password = 'Le mot de passe ne peut pas dépasser 128 caractères';
    }

    // Validation de la confirmation du mot de passe
    if (!confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (confirmPassword !== credentials.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      clearError();
      
      try {
        console.log('📝 RegisterForm - Submitting registration form for user:', credentials.username);
        
        // Préparer les données pour l'inscription
        const registrationData = {
          username: credentials.username.trim(),
          email: credentials.email.trim().toLowerCase(),
          password: credentials.password,
          firstName: credentials.firstName.trim(),
          lastName: credentials.lastName.trim(),
        };

        const success = await register(registrationData);
        
        if (success) {
          console.log('✅ RegisterForm - Registration successful, showing success message');
          showSuccessMessage('Compte créé avec succès ! Vous êtes maintenant connecté.');
          // Appeler le callback onRegister si fourni
          if (onRegister) {
            onRegister(registrationData);
          }
        } else {
          // L'erreur est déjà gérée par le store
          console.log('⚠️ RegisterForm - Registration failed, error already handled by store');
        }
      } catch (error: any) {
        console.error('❌ RegisterForm - Unexpected error during registration:', {
          error: error.message,
          stack: error.stack,
          type: error.constructor.name
        });
        showErrorMessage('Erreur inattendue lors de l\'inscription');
      }
    }
  };

  const handleInputChange = (field: keyof RegisterCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    
    // Effacer l'erreur de validation quand l'utilisateur commence à taper
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Effacer l'erreur d'authentification quand l'utilisateur modifie les champs
    if (error) {
      clearError();
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    // Effacer l'erreur de validation quand l'utilisateur commence à taper
    if (validationErrors.confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
    
    // Effacer l'erreur d'authentification quand l'utilisateur modifie les champs
    if (error) {
      clearError();
    }
  };

  // Fonction pour formater le message d'erreur
  const formatErrorMessage = (errorMsg: string): string => {
    if (errorMsg.includes('Un utilisateur avec ce nom ou email existe déjà')) {
      return 'Ce nom d\'utilisateur ou cette adresse email est déjà utilisé. Veuillez en choisir un autre.';
    }
    if (errorMsg.includes('Erreur serveur')) {
      return 'Le serveur rencontre des difficultés. Veuillez réessayer dans quelques minutes.';
    }
    if (errorMsg.includes('Impossible de se connecter au serveur')) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion internet et réessayez.';
    }
    return errorMsg;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8 z-10">
        {/* En-tête avec logo et titre */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h2 className="mt-8 text-center text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Créer un compte
          </h2>
          <p className="mt-3 text-center text-lg text-gray-600">
            Rejoignez notre plateforme de vision multimodale
          </p>
        </div>
        
        {/* Formulaire d'inscription */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 transform hover:scale-[1.02] transition-all duration-300">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur d'inscription
                    </h3>
                    <div className="mt-1 text-sm text-red-700">
                      {formatErrorMessage(error)}
                    </div>
                    {error.includes('Erreur serveur') && (
                      <div className="mt-2 text-xs text-red-600">
                        Si le problème persiste, contactez l'administrateur.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Champs prénom et nom sur la même ligne */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  label="Prénom"
                  placeholder="Entrez votre prénom"
                  value={credentials.firstName}
                  onChange={(value) => handleInputChange('firstName', value)}
                  error={validationErrors.firstName}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Input
                  label="Nom"
                  placeholder="Entrez votre nom"
                  value={credentials.lastName}
                  onChange={(value) => handleInputChange('lastName', value)}
                  error={validationErrors.lastName}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            {/* Champ nom d'utilisateur */}
            <div className="space-y-2">
              <Input
                label="Nom d'utilisateur"
                placeholder="Choisissez un nom d'utilisateur"
                value={credentials.username}
                onChange={(value) => handleInputChange('username', value)}
                error={validationErrors.username}
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Champ email */}
            <div className="space-y-2">
              <Input
                label="Adresse email"
                type="email"
                placeholder="Entrez votre adresse email"
                value={credentials.email}
                onChange={(value) => handleInputChange('email', value)}
                error={validationErrors.email}
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Champ mot de passe */}
            <div className="space-y-2">
              <Input
                label="Mot de passe"
                type="password"
                placeholder="Choisissez un mot de passe (min. 6 caractères)"
                value={credentials.password}
                onChange={(value) => handleInputChange('password', value)}
                error={validationErrors.password}
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Champ confirmation mot de passe */}
            <div className="space-y-2">
              <Input
                label="Confirmer le mot de passe"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={validationErrors.confirmPassword}
                required
                disabled={isLoading}
              />
            </div>
            
            {/* Conditions d'utilisation */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="ml-2 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  J'accepte les{' '}
                  <a href="#" className="font-medium text-green-600 hover:text-green-500 hover:underline">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="font-medium text-green-600 hover:text-green-500 hover:underline">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            </div>
            
            {/* Bouton d'inscription */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création du compte...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Lien de connexion */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Vous avez déjà un compte ?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-green-600 hover:text-green-500 transition-colors duration-200 hover:underline cursor-pointer"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;


