import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UploadPage from '../UploadPage';
import { documentApi } from '../../services/api';

// Types pour les mocks
interface MockButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: unknown;
}

interface MockCardProps {
  children: React.ReactNode;
  [key: string]: unknown;
}

interface MockLoadingSpinnerProps {
  size?: string;
}

interface MockFileUploadProps {
  onFileSelect: (files: Array<{ file: File; type: string }>) => void;
}

// Mock de l'API
vi.mock('../../services/api', () => ({
  documentApi: {
    getDocuments: vi.fn(),
    processDocument: vi.fn(),
  },
}));

const mockDocumentApi = documentApi as unknown as {
  getDocuments: ReturnType<typeof vi.fn>;
  processDocument: ReturnType<typeof vi.fn>;
};

// Mock des composants UI
vi.mock('../../components/ui', () => ({
  Button: ({ children, onClick, ...props }: MockButtonProps) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: MockCardProps) => (
    <div {...props}>{children}</div>
  ),
  LoadingSpinner: ({ size }: MockLoadingSpinnerProps) => (
    <div data-testid={`loading-spinner-${size}`}>Loading...</div>
  ),
}));

// Mock du composant FileUpload
vi.mock('../../components/FileUpload', () => ({
  default: ({ onFileSelect }: MockFileUploadProps) => (
    <div data-testid="file-upload">
      <button onClick={() => onFileSelect([{ file: new File([''], 'test.pdf'), type: 'pdf' }])}>
        Simuler upload
      </button>
    </div>
  ),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UploadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock par défaut pour getDocuments
    mockDocumentApi.getDocuments.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });
  });

  it('rend la page avec le titre correct', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByText('Upload et Gestion des Documents')).toBeInTheDocument();
    expect(screen.getByText('Téléchargez de nouveaux documents et gérez votre bibliothèque')).toBeInTheDocument();
  });

  it('affiche la section d\'upload', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByText('Upload de nouveaux documents')).toBeInTheDocument();
    expect(screen.getByText('Sélectionnez vos fichiers pour traitement automatique')).toBeInTheDocument();
    expect(screen.getByTestId('file-upload')).toBeInTheDocument();
  });

  it('affiche la section de gestion des documents', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByText('Documents uploadés')).toBeInTheDocument();
    expect(screen.getByText('Gérez et consultez tous vos documents traités')).toBeInTheDocument();
  });

  it('affiche les filtres de base', () => {
    renderWithRouter(<UploadPage />);
    
    // Test des valeurs sélectionnées par défaut
    expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tous les types')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Date d\'upload')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Décroissant')).toBeInTheDocument();
  });

  it('affiche le champ de recherche', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByPlaceholderText('Rechercher dans le contenu des documents...')).toBeInTheDocument();
  });

  it('affiche le bouton de retour au dashboard', () => {
    renderWithRouter(<UploadPage />);
    
    expect(screen.getByText('← Retour au Dashboard')).toBeInTheDocument();
  });

  it('charge les documents au montage', async () => {
    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(mockDocumentApi.getDocuments).toHaveBeenCalledWith({
        page: 0,
        size: 20,
        sortBy: 'uploadedAt',
        sortDir: 'desc',
      });
    });
  });

  it('affiche un message quand aucun document n\'est trouvé', async () => {
    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Aucun document')).toBeInTheDocument();
      expect(screen.getByText('Vous n\'avez pas encore uploadé de documents.')).toBeInTheDocument();
    });
  });

  it('affiche la liste des documents quand ils existent', async () => {
    const mockDocuments = [
      {
        id: 1,
        fileName: 'test.pdf',
        originalFileName: 'test.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 1024,
        status: 'COMPLETED',
        uploadedById: 1,
        uploadedByUsername: 'testuser',
        uploadedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockDocumentApi.getDocuments.mockResolvedValue({
      content: mockDocuments,
      totalElements: 1,
      totalPages: 1,
      currentPage: 0,
      size: 20,
      first: true,
      last: true,
    });

    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });

  it('gère les erreurs de chargement', async () => {
    mockDocumentApi.getDocuments.mockRejectedValue(new Error('Erreur de connexion'));

    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Erreur de connexion')).toBeInTheDocument();
      expect(screen.getByText('Réessayer')).toBeInTheDocument();
    });
  });

  it('filtre les documents par statut', async () => {
    renderWithRouter(<UploadPage />);
    
    const statusSelect = screen.getByDisplayValue('Tous les statuts');
    fireEvent.change(statusSelect, { target: { value: 'PENDING' } });
    
    await waitFor(() => {
      expect(mockDocumentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'PENDING',
        })
      );
    });
  });

  it('filtre les documents par type de fichier', async () => {
    renderWithRouter(<UploadPage />);
    
    const typeSelect = screen.getByDisplayValue('Tous les types');
    fireEvent.change(typeSelect, { target: { value: 'application/pdf' } });
    
    await waitFor(() => {
      expect(mockDocumentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          fileType: 'application/pdf',
        })
      );
    });
  });

  it('change l\'ordre de tri', async () => {
    renderWithRouter(<UploadPage />);
    
    const sortDirSelect = screen.getByDisplayValue('Décroissant');
    fireEvent.change(sortDirSelect, { target: { value: 'asc' } });
    
    await waitFor(() => {
      expect(mockDocumentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          sortDir: 'asc',
        })
      );
    });
  });

  it('recherche dans les documents avec debounce', async () => {
    vi.useFakeTimers();
    
    renderWithRouter(<UploadPage />);
    
    const searchInput = screen.getByPlaceholderText('Rechercher dans le contenu des documents...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Avance le temps pour déclencher le debounce
    vi.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(mockDocumentApi.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          searchQuery: 'test',
        })
      );
    }, { timeout: 1000 });
    
    vi.useRealTimers();
  });

  it('simule l\'upload d\'un fichier', async () => {
    mockDocumentApi.processDocument.mockResolvedValue({ success: true });
    
    renderWithRouter(<UploadPage />);
    
    const uploadButton = screen.getByText('Simuler upload');
    fireEvent.click(uploadButton);
    
    await waitFor(() => {
      expect(mockDocumentApi.processDocument).toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('affiche le compteur total de documents', async () => {
    mockDocumentApi.getDocuments.mockResolvedValue({
      content: [],
      totalElements: 42,
      totalPages: 3,
      currentPage: 0,
      size: 20,
      first: true,
      last: false,
    });

    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(screen.getByText('42 documents au total')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('affiche la pagination quand il y a plusieurs pages', async () => {
    mockDocumentApi.getDocuments.mockResolvedValue({
      content: [],
      totalElements: 50,
      totalPages: 3,
      currentPage: 0,
      size: 20,
      first: true,
      last: false,
    });

    renderWithRouter(<UploadPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Page 1 sur 3 (50 documents)')).toBeInTheDocument();
      expect(screen.getByText('Première')).toBeInTheDocument();
      expect(screen.getByText('Suivante')).toBeInTheDocument();
    }, { timeout: 1000 });
  });
});
