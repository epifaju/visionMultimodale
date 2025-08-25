import axios from 'axios';

// Configuration de base d'axios
const api = axios.create({
  baseURL: '/api', // Utilise le proxy Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
    const response = await api.get('/documents', { params });
    return response.data;
  },

  // Récupérer un document par ID
  getDocumentById: async (id: string) => {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  // Traiter un document
  processDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/process', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Extraction OCR
  extractOcr: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Extraction PDF
  extractPdf: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/pdf', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Lecture de codes-barres
  readBarcodes: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/documents/barcode', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Analyse avec Ollama
  analyzeWithOllama: async (text: string, prompt?: string) => {
    const response = await api.post('/documents/analyze', {
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

  // Statut des services
  getServicesStatus: async () => {
    const response = await api.get('/documents/status');
    return response.data;
  },
};

// Service pour l'authentification
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Service pour les utilisateurs
export const userApi = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },

  updateProfile: async (userData: { username?: string; email?: string }) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },
};

export default api;
