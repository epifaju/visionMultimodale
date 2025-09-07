// Types d'authentification
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
  firstName: string;
  lastName: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Types de documents - Mise à jour pour correspondre au backend
export interface Document {
  id: number;
  fileName: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  ocrConfidence?: number;
  detectedLanguage?: string;
  status: ProcessingStatus;
  processingErrors?: string;
  metadata?: string;
  uploadedById: number;
  uploadedByUsername: string;
  uploadedAt: string;
  processedAt?: string;
  updatedAt: string;
}

export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR' | 'PROCESSED';

export interface DocumentUpload {
  file: File;
  type: 'image' | 'pdf' | 'document';
}

export interface ProcessingResult {
  documentId: number;
  processingTime: number;
  ocrResult?: {
    text: string;
    confidence: number;
    language: string;
  };
  pdfResult?: {
    pageCount: number;
    text: string;
    metadata: Record<string, string>;
  } | null;
  barcodeResult?: {
    barcodes: Array<{
      type: string;
      data: string;
      format: string;
    }>;
  };
  mrzResult?: {
    documentType: string;
    country: string;
    surname: string;
    givenNames: string;
    documentNumber: string;
    nationality: string;
    dateOfBirth: string;
    sex: string;
    expiryDate: string;
    personalNumber: string;
  } | null;
}

// Types de navigation
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

// Types d'API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  first: boolean;
  last: boolean;
}

// Types de composants
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  as?: 'button' | 'a';
  href?: string;
  loading?: boolean;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'file';
  error?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  success?: boolean;
  warning?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

// Types de notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  read?: boolean;
  timestamp?: string;
}

// Types de filtres
export interface DocumentFilters {
  status?: string | null;
  type?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  searchQuery?: string;
}

// Types pour les services de traitement de documents
export interface OcrResult {
  success: boolean;
  text: string;
  confidence: number;
  language: string;
  textLength: number;
  processingTime: number;
  errorMessage?: string;
}

export interface PdfResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  pageCount: number;
  text: string;
  detectedLanguage: string;
  hasText: boolean;
  hasImages: boolean;
  metadata: Record<string, any>;
  pages: PageInfo[];
  errorMessage?: string;
}

export interface PageInfo {
  pageNumber: number;
  width: number;
  height: number;
  rotation: number;
  textLength: number;
  hasText: boolean;
}

export interface BarcodeResult {
  success: boolean;
  fileName: string;
  fileSize: number;
  imageWidth: number;
  imageHeight: number;
  barcodeCount: number;
  barcodes: BarcodeInfo[];
  typeCounts: Record<string, number>;
  errorMessage?: string;
}

export interface BarcodeInfo {
  text: string;
  format: string;
  confidence: number;
  topLeftX?: number;
  topLeftY?: number;
}

export interface MrzResult {
  success: boolean;
  fileName: string;
  mrzText: string;
  data: MrzData;
  errorMessage?: string;
}

export interface MrzData {
  documentType: 'PASSPORT' | 'ID_CARD' | 'UNKNOWN';
  issuingCountry: string;
  surname: string;
  givenNames: string;
  documentNumber: string;
  nationality: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED';
  expiryDate: string;
  personalNumber: string;
}

export interface OllamaResult {
  success: boolean;
  model: string;
  prompt: string;
  response: string;
  done: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ServicesStatus {
  timestamp: number;
  services: {
    ocr: {
      available: boolean;
      language: string;
      version: string;
    };
    pdf: {
      available: boolean;
      version: string;
    };
    barcode: {
      available: boolean;
      version: string;
      supportedFormats: string[];
    };
    mrz: {
      available: boolean;
      version: string;
      supportedTypes: string[];
    };
    ollama: {
      available: boolean;
      version: string;
      model: string;
    };
  };
}

// Types pour les composants de traitement
export interface ProcessingStep {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface ProcessingOptions {
  enableOcr: boolean;
  enablePdf: boolean;
  enableBarcode: boolean;
  enableMrz: boolean;
  enableOllama: boolean;
  customPrompt?: string;
  targetLanguage?: string;
}
