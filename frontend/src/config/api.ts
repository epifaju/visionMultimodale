// Configuration API pour différents environnements
export const API_CONFIG = {
  // Mode développement - utilise le proxy Vite (recommandé)
  development: {
    baseURL: '/api', // Utilise le proxy Vite
    withCredentials: true,
    useProxy: true
  },
  
  // Mode développement direct - accès direct au backend
  developmentDirect: {
    baseURL: 'http://localhost:8080/api', // Accès direct
    withCredentials: true,
    useProxy: false
  },
  
  // Mode production
  production: {
    baseURL: import.meta.env.VITE_API_URL || defaultEnv.VITE_API_URL,
    withCredentials: true,
    useProxy: false
  }
};

// Détection automatique de l'environnement
const isDevelopment = import.meta.env.DEV;
const useDirectConnection = import.meta.env.VITE_USE_DIRECT_CONNECTION === 'true';

// Valeurs par défaut pour éviter les erreurs
const defaultEnv = {
  VITE_API_URL: 'http://localhost:8080/api',
  VITE_USE_DIRECT_CONNECTION: 'false',
  VITE_CORS_ENABLED: 'true'
};

// Configuration active
export const getApiConfig = () => {
  if (isDevelopment && useDirectConnection) {
    return API_CONFIG.developmentDirect;
  } else if (isDevelopment) {
    return API_CONFIG.development;
  } else {
    return API_CONFIG.production;
  }
};

// Configuration actuelle
export const currentConfig = getApiConfig();

console.log('🔧 API Configuration:', {
  environment: isDevelopment ? 'development' : 'production',
  baseURL: currentConfig.baseURL,
  withCredentials: currentConfig.withCredentials,
  useProxy: currentConfig.useProxy
});
