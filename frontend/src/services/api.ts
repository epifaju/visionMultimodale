import axios from 'axios';
import { currentConfig } from '../config/api';

// Configuration de base d'axios
const api = axios.create({
  baseURL: currentConfig.baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Configuration CORS pour les requêtes cross-origin
  withCredentials: currentConfig.withCredentials,
  timeout: 30000, // Timeout global de 30 secondes
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    // Log de débogage pour toutes les requêtes
    console.log('🌐 API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      hasToken: !!token,
      isFormData: config.data instanceof FormData,
      headers: config.headers
    });
    
    // Exception temporaire : ne pas ajouter d'authentification pour test-upload
    if (config.url === '/documents/test-upload') {
      console.log('🚫 Skipping authentication for test-upload endpoint');
      // Supprimer tout header d'authentification existant
      delete config.headers.Authorization;
      
      // Pour les requêtes multipart/form-data, laisser axios gérer le Content-Type
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
        // Ajouter des headers spécifiques pour les uploads de fichiers
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        console.log('📎 FormData detected - Content-Type header removed, upload headers added');
      }
      
      return config;
    }
    
    if (token) {
      // Toujours ajouter le token d'authentification pour les autres endpoints
      config.headers.Authorization = `Bearer ${token}`;
      
      // Pour les requêtes multipart/form-data, laisser axios gérer le Content-Type
      if (config.data instanceof FormData) {
        // Supprimer le Content-Type pour laisser le navigateur le définir avec la boundary
        delete config.headers['Content-Type'];
        // Ajouter des headers spécifiques pour les uploads de fichiers
        config.headers['Accept'] = 'application/json';
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        console.log('📎 FormData detected - Content-Type header removed, upload headers added');
      }
    } else {
      console.log('⚠️ No auth token found - request will be sent without authentication');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    // Extraire les informations d'erreur
    const errorResponse = {
      status: error.response?.status || 0,
      statusText: error.response?.statusText || 'Unknown error',
      data: error.response?.data || {},
      url: error.config?.url || 'Unknown URL',
      method: error.config?.method || 'Unknown method'
    };

    // Log détaillé pour le débogage
    console.error('API Error Details:', errorResponse);
    
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      // Rediriger vers la page de connexion seulement si on n'y est pas déjà
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Accès refusé
      console.error('Access denied:', errorResponse);
    } else if (error.response?.status === 400) {
      // Erreur de validation
      console.warn('Validation error:', errorResponse);
    } else if (error.response?.status === 500) {
      // Erreur serveur - log détaillé
      console.error('Server Error Details:', errorResponse);
    } else if (error.code === 'ERR_NETWORK') {
      // Erreur de réseau
      console.error('Network error - server may be down:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour extraire le message d'erreur
export const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

// Service pour les documents
export const documentApi = {
  // Récupérer la liste des documents
  getDocuments: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    status?: string;
    fileType?: string;
    searchQuery?: string;
  }) => {
    try {
      // Construire les paramètres de requête
      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.fileType) queryParams.append('fileType', params.fileType);
      if (params?.searchQuery) queryParams.append('searchQuery', params.searchQuery);

      const url = `/documents${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await api.get(url);
      
      console.log('📋 Documents récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Retourner une structure par défaut en cas d'erreur
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        currentPage: 0,
        size: 20,
        first: true,
        last: true
      };
    }
  },

  // Récupérer un document par ID
  getDocumentById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Traiter un document
  processDocument: async (file: File) => {
    console.log("🚀 UPLOAD EN COURS - Backend activé!");
    console.log("📁 Fichier à uploader:", {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Utiliser l'endpoint test-upload (l'intercepteur gère l'authentification)
      const response = await api.post('/documents/test-upload', formData, {
        timeout: 30000, // 30 secondes de timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB max
        maxBodyLength: 50 * 1024 * 1024, // 50MB max
      });
      
      console.log("✅ UPLOAD RÉUSSI:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur lors de l'upload:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  // Extraction OCR
  extractOcr: async (file: File) => {
    console.log("🔍 OCR - Traitement en cours");
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/documents/ocr', formData, {
        timeout: 60000, // 60 secondes pour OCR
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur OCR:", error);
      throw error;
    }
  },

  // Extraction PDF
  extractPdf: async (file: File) => {
    console.log('📄 PDF - Traitement en cours');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/documents/pdf', formData, {
        timeout: 60000, // 60 secondes pour PDF
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur PDF:", error);
      throw error;
    }
  },

  // Lecture de codes-barres
  readBarcodes: async (file: File) => {
    console.log('📊 Barcode - Traitement en cours');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/documents/barcode', formData, {
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur Barcode:", error);
      throw error;
    }
  },

  // Extraction MRZ
  extractMrz: async (file: File) => {
    console.log('🆔 MRZ - Traitement en cours');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await api.post('/documents/mrz', formData, {
        timeout: 30000,
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur MRZ:", error);
      throw error;
    }
  },

  // Analyse IA avec Ollama (image)
  analyzeWithOllama: async (file: File, prompt?: string) => {
    console.log('🤖 Ollama - Analyse IA en cours');
    const formData = new FormData();
    formData.append('file', file);
    if (prompt) {
      formData.append('prompt', prompt);
    }
    
    try {
      const response = await api.post('/documents/analyze', formData, {
        timeout: 360000, // 6 minutes pour l'IA (plus que le backend pour être sûr)
        maxContentLength: 50 * 1024 * 1024,
        maxBodyLength: 50 * 1024 * 1024,
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Erreur Ollama:", error);
      throw error;
    }
  },

  // Analyse de texte avec Ollama
  analyzeTextWithOllama: async (text: string, prompt?: string) => {
    const response = await api.post('/documents/analyze-text', {
      text,
      prompt: prompt || 'Analyze this text',
    });
    return response.data;
  },

  // Résumé avec Ollama
  summarizeWithOllama: async (text: string) => {
    const response = await api.post('/documents/summarize', { text });
    return response.data;
  },

  // Traduction avec Ollama
  translateWithOllama: async (text: string, targetLanguage: string) => {
    const response = await api.post('/documents/translate', { 
      text, 
      targetLanguage 
    });
    return response.data;
  },

  // Classification de document avec Ollama
  classifyDocument: async (text: string) => {
    const response = await api.post('/documents/classify', { text });
    return response.data;
  },

  // Extraction d'informations structurées avec Ollama
  extractStructuredInfo: async (text: string) => {
    const response = await api.post('/documents/extract-structured', { text });
    return response.data;
  },

  // Statut des services
  getServicesStatus: async () => {
    const response = await api.get('/documents/status');
    return response.data;
  },

  // Test d'authentification
  testAuth: async () => {
    const response = await api.get('/documents/test-auth');
    return response.data;
  },

  // Test d'authentification avec POST
  testAuthPost: async () => {
    const response = await api.post('/documents/test-auth-post');
    return response.data;
  },
};

// Service pour l'authentification
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    try {
      // Log détaillé des données envoyées
      console.log('🔐 Login API - Sending credentials:', {
        username: credentials.username,
        passwordLength: credentials.password.length,
        endpoint: '/api/auth/login'
      });

      const response = await api.post('/auth/login', credentials);
      
      console.log('✅ Login API - Success response:', {
        status: response.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        userRole: response.data?.user?.role
      });
      
      return response.data;
    } catch (error: any) {
      // Log détaillé des erreurs
      console.error('❌ Login API - Detailed error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        requestData: error.config?.data
      });
      
      // Log spécifique pour les erreurs 500
      if (error.response?.status === 500) {
        console.error('🚨 Server Error Details:', {
          error: error.response?.data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      }
      
      throw error; // Relancer l'erreur pour que le store puisse la gérer
    }
  },

  register: async (userData: { username: string; email: string; password: string; firstName: string; lastName: string }) => {
    try {
      console.log('📝 Register API - Sending registration data:', {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordLength: userData.password.length,
        endpoint: '/api/auth/register'
      });

      const response = await api.post('/auth/register', userData);
      
      console.log('✅ Register API - Success response:', {
        status: response.status,
        hasToken: !!response.data?.token,
        hasUser: !!response.data?.user,
        userRole: response.data?.user?.role
      });
      
      return response.data;
    } catch (error: any) {
      // Log détaillé des erreurs
      console.error('❌ Register API - Detailed error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        requestData: error.config?.data
      });
      
      // Log spécifique pour les erreurs 500
      if (error.response?.status === 500) {
        console.error('🚨 Server Error Details:', {
          error: error.response?.data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        });
      }
      
      throw error; // Relancer l'erreur pour que le store puisse la gérer
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },
};

// Service pour les utilisateurs
export const userApi = {
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Get current user API error:', error);
      throw error;
    }
  },

  updateProfile: async (userData: { username?: string; email?: string }) => {
    try {
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Update profile API error:', error);
      throw error;
    }
  },
};

export default api;
